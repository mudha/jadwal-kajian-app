import { dzikirPetang } from '@/data/dzikir-petang';
import DzikirViewer from '@/components/DzikirViewer';

export default function DzikirPetangPage() {
    return (
        <DzikirViewer
            data={dzikirPetang}
            title="Dzikir Petang"
            description="Dibaca setelah shalat Ashar hingga terbenam matahari"
            colorTheme="orange"
        />
    );
}
