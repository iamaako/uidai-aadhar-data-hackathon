
import { getSADRAData } from "@/lib/sadra";
import SADRAModule from "@/components/SADRAModule";

export const dynamic = 'force-dynamic';

export default async function SADRAPage() {
    try {
        const sadraData = await getSADRAData();

        return (
            <main className="min-h-screen">
                <SADRAModule data={sadraData} />
            </main>
        );
    } catch (error) {
        return (
            <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
                <h1>Analysis Error</h1>
                <p>Could not load SADRA data. Ensure monthly JSON files are present.</p>
                <pre>{(error as Error).message}</pre>
            </div>
        );
    }
}
