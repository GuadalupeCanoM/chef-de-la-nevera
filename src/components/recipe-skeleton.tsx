import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

export function RecipeSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="w-full aspect-video" />
            <CardHeader>
                <Skeleton className="h-8 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/4 mt-2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="space-y-3">
                    <Skeleton className="h-6 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                </div>
                 <Separator />
                <div className="space-y-3">
                    <Skeleton className="h-6 w-2/5 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-4/5 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                </div>
                 <Separator />
                <div className="space-y-3">
                    <Skeleton className="h-6 w-1/2 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                </div>
            </CardContent>
        </Card>
    )
}
