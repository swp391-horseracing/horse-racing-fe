export default function DashboardPage() {
    const dashboardCards = [
        {
            title: "Total Horses",
            value: 128,
        },
        {
            title: "Active Jockeys",
            value: 42,
        },
        {
            title: "Upcoming Races",
            value: 16,
        },
        {
            title: "Total Owners",
            value: 31,
        },
    ];

    const upcomingRaces = [
        {
            id: 1,
            race: "Spring Championship",
            location: "Tokyo Track",
            date: "2026-05-24",
        },
        {
            id: 2,
            race: "Golden Cup",
            location: "London Arena",
            date: "2026-05-26",
        },
        {
            id: 3,
            race: "Night Speed Derby",
            location: "Dubai Track",
            date: "2026-05-28",
        },
    ];

    return (
        <div className="h-full bg-gray-100 p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    Horse Racing Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                    Overview of tournament activity and racing statistics
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                {dashboardCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-5 shadow-sm border"
                    >
                        <p className="text-gray-500 text-sm">
                            {card.title}
                        </p>

                        <h2 className="text-3xl font-bold mt-2">
                            {card.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upcoming Races */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Upcoming Races
                        </h2>

                        <button className="text-sm text-black hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">

                        {upcomingRaces.map((race) => (
                            <div
                                key={race.id}
                                className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50 transition"
                            >

                                <div>
                                    <h3 className="font-semibold">
                                        {race.race}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {race.location}
                                    </p>
                                </div>

                                <div className="text-sm text-gray-500">
                                    {race.date}
                                </div>

                            </div>
                        ))}

                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-xl shadow-sm border p-5">

                    <h2 className="text-xl font-semibold mb-4">
                        Top Horses
                    </h2>

                    <div className="space-y-4">

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">
                                    Thunder Bolt
                                </p>

                                <p className="text-sm text-gray-500">
                                    Win Rate: 92%
                                </p>
                            </div>

                            <span className="font-bold">
                                #1
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">
                                    Dark Phantom
                                </p>

                                <p className="text-sm text-gray-500">
                                    Win Rate: 88%
                                </p>
                            </div>

                            <span className="font-bold">
                                #2
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">
                                    Silver Storm
                                </p>

                                <p className="text-sm text-gray-500">
                                    Win Rate: 85%
                                </p>
                            </div>

                            <span className="font-bold">
                                #3
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}