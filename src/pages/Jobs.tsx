import { WeeklyCalendar } from "@/components/jobs/WeeklyCalendar";
import { PastCompletedJobs } from "@/components/jobs/PastCompletedJobs";

export default function Jobs() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <WeeklyCalendar />
            <PastCompletedJobs />
        </div>
    );
}
