
import AddContestForm from '../../../components/AddContestForm';
import { db } from '../../db';

export default async function Page(): Promise<JSX.Element> {
    const problems = await db.problem.findMany({
        where: {
            hidden: false // Only fetch visible problems
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
            solved: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <main className="container mx-auto px-4 py-8">
            <AddContestForm problems={problems} />
        </main>
    );
}
