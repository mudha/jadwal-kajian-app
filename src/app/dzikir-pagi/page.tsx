import { dzikirPagi } from '@/data/dzikir-pagi';
import DzikirViewer from '@/components/DzikirViewer';

export default function DzikirPagiPage() {
    return (
        <DzikirViewer
            data={dzikirPagi}
            title="Dzikir Pagi"
            description="Dibaca setelah shalat Shubuh hingga terbit matahari"
            colorTheme="teal"
        />
    );
}
