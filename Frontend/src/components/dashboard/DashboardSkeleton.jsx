import Skeleton from "../ui/Skeleton";

export default function DashboardSkeleton() {
	return (
		<div
			aria-busy="true"
			aria-label="Loading dashboard"
			className="flex flex-col gap-8"
		>
			<header>
				<Skeleton className="h-6 w-28" />
				<Skeleton className="mt-2 h-4 w-64 max-w-full" />
			</header>

			<section
				aria-label="Loading dashboard statistics"
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				{Array.from({ length: 4 }, (_, index) => (
					<div
						key={`stat-${index}`}
						className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
					>
						<Skeleton className="h-4 w-28" />
						<Skeleton className="mt-3 h-9 w-16" />
						<Skeleton className="mt-3 h-6 w-32 rounded-full" />
					</div>
				))}
			</section>

			<section
				aria-label="Loading projects"
				className="flex flex-col gap-4"
			>
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-16" />
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }, (_, index) => (
						<div
							key={`project-${index}`}
							className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="mt-2 h-5 w-40 max-w-full" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
							<Skeleton className="mt-3 h-4 w-full" />
							<Skeleton className="mt-2 h-4 w-4/5" />
							<div className="mt-5 flex items-center justify-between">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-10" />
							</div>
							<Skeleton className="mt-2 h-2 w-full rounded-full" />
							<div className="mt-4 flex -space-x-2">
								{Array.from({ length: 3 }, (_, memberIndex) => (
									<Skeleton
										key={`project-${index}-member-${memberIndex}`}
										className="h-7 w-7 rounded-full border-2 border-white"
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			<section
				aria-label="Loading tasks"
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center justify-between gap-4">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-4 w-16" />
					</div>
					<Skeleton className="h-9 w-full rounded-lg lg:max-w-xs" />
				</div>

				<div className="flex gap-2 overflow-hidden pb-1">
					{Array.from({ length: 6 }, (_, index) => (
						<Skeleton
							key={`filter-${index}`}
							className="h-8 w-16 shrink-0 rounded-lg"
						/>
					))}
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{Array.from({ length: 4 }, (_, index) => (
						<div
							key={`task-${index}`}
							className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="mt-2 h-5 w-4/5" />
									<Skeleton className="mt-2 h-4 w-32" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
							<div className="mt-4 flex flex-wrap items-center gap-4">
								<Skeleton className="h-7 w-20 rounded-full" />
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-6 w-16 rounded-full" />
							</div>
						</div>
					))}
				</div>
			</section>

			<section
				aria-label="Loading recent activity"
				className="flex flex-col gap-4"
			>
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-16" />
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
					{Array.from({ length: 5 }, (_, index) => (
						<div
							key={`activity-${index}`}
							className={`relative flex gap-3 ${index < 4 ? "pb-5" : ""}`}
						>
							{index < 4 && (
								<span
									className="absolute left-4 top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200"
									aria-hidden="true"
								/>
							)}
							<Skeleton className="relative z-10 h-8 w-8 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-16" />
								</div>
								<Skeleton className="mt-2 h-4 w-4/5" />
								<Skeleton className="mt-2 h-3 w-48 max-w-full" />
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
