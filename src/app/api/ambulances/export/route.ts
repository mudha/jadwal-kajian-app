import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { format, region } = await request.json();

        // Fetch ambulances
        let query = 'SELECT * FROM ambulances ORDER BY region, city, name';
        const args: any[] = [];

        if (region) {
            query = 'SELECT * FROM ambulances WHERE region = ? ORDER BY city, name';
            args.push(region);
        }

        const result = await db.execute({ sql: query, args });
        const ambulances = result.rows.map((row: any) => ({
            ...row,
            contacts: JSON.parse(row.contacts || '[]')
        }));

        if (format === 'excel') {
            return exportToExcel(ambulances);
        } else if (format === 'pdf') {
            return exportToPDF(ambulances);
        }

        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}

function exportToExcel(ambulances: any[]) {
    // Prepare data for Excel
    const data = ambulances.map(a => ({
        'Nama': a.name,
        'Region': a.region,
        'Kota': a.city || '',
        'Alamat': a.address || '',
        'Kontak WhatsApp': a.contacts.map((c: string) => `+${c}`).join(', '),
        'Catatan': a.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ambulans Gratis');

    // Auto-size columns
    const maxWidth = data.reduce((w: any, r: any) => {
        return Object.keys(r).map((k, idx) => {
            const value = r[k] ? r[k].toString() : '';
            return Math.max(w[idx] || 10, value.length, k.length);
        });
    }, []);

    ws['!cols'] = maxWidth.map((w: number) => ({ wch: Math.min(w + 2, 50) }));

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="ambulans-gratis-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
    });
}

function exportToPDF(ambulances: any[]) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AMBULANS MUSLIM INDONESIA - GRATIS', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jemput Pasien Rumah Sakit dan Pengurusan Jenazah', 105, 22, { align: 'center' });
    doc.text(`Update: ${new Date().toLocaleDateString('id-ID')}`, 105, 27, { align: 'center' });

    // Group by region
    const grouped: { [key: string]: any[] } = {};
    ambulances.forEach(a => {
        if (!grouped[a.region]) grouped[a.region] = [];
        grouped[a.region].push(a);
    });

    let yPos = 35;

    Object.keys(grouped).sort().forEach((region, idx) => {
        if (idx > 0 && yPos > 250) {
            doc.addPage();
            yPos = 15;
        }

        // Region header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(region, 14, yPos);
        yPos += 7;

        grouped[region].forEach((ambulance, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 15;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${ambulance.name}`, 14, yPos);
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            if (ambulance.city) {
                doc.text(`   ${ambulance.city}`, 14, yPos);
                yPos += 4;
            }

            if (ambulance.address) {
                const addressLines = doc.splitTextToSize(`   ${ambulance.address}`, 180);
                addressLines.forEach((line: string) => {
                    doc.text(line, 14, yPos);
                    yPos += 4;
                });
            }

            // Contacts
            ambulance.contacts.forEach((contact: string) => {
                doc.text(`   wa.me/${contact}`, 14, yPos);
                yPos += 4;
            });

            if (ambulance.notes) {
                doc.setFont('helvetica', 'italic');
                const notesLines = doc.splitTextToSize(`   ${ambulance.notes}`, 180);
                notesLines.forEach((line: string) => {
                    doc.text(line, 14, yPos);
                    yPos += 4;
                });
                doc.setFont('helvetica', 'normal');
            }

            yPos += 3; // Space between entries
        });

        yPos += 5; // Space between regions
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ambulans-gratis-${new Date().toISOString().split('T')[0]}.pdf"`
        }
    });
}
