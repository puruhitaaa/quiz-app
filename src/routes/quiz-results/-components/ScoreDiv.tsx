import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ScoreDivProps = {
  loading?: boolean
  title: string
  value: number
  color?: "primary" | "green" | "red"
}

function ScoreDiv({ loading = false, title, value, color }: ScoreDivProps) {
  return (
    <div className='flex flex-col items-start gap-1'>
      {!loading ? (
        <>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <h5
            className={cn("text-2xl font-bold", {
              "text-primary": color === "primary",
              "text-red-500": color === "red",
              "text-green-500": color === "green",
            })}
          >
            {value}
          </h5>
        </>
      ) : (
        <>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-8' />
        </>
      )}
    </div>
  )
}

export default ScoreDiv
