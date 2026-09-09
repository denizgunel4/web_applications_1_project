

const mapPositions = {
    easy: [
        { x: 20, y: 75 },
        { x: 80, y: 25 },
        { x: 25, y: 25 },
        { x: 75, y: 75 },
    ],

    intermediate: [
        { x: 20, y: 75 },
        { x: 40, y: 60 },
        { x: 60, y: 40 },
        { x: 80, y: 25 },
        { x: 20, y: 25 },
        { x: 40, y: 30 },
        { x: 60, y: 75 },
        { x: 80, y: 70 },
    ],

    hard: [
        { x: 15, y: 80 },
        { x: 29, y: 69 },
        { x: 43, y: 58 },
        { x: 57, y: 47 },
        { x: 71, y: 36 },
        { x: 85, y: 25 },
        { x: 15, y: 25 },
        { x: 30, y: 40 },
        { x: 45, y: 80 },
        { x: 60, y: 75 },
        { x: 75, y: 65 },
        { x: 85, y: 55 },
    ],
};

function Map({ difficulty, revealedLocations }) {
    const positions = mapPositions[difficulty];

    return (
        <div className="map">
            <div className="map-title">🗺️ Treasure Map</div>

            {positions.map((position, index) => {
                const revealedLocation = revealedLocations.find(
                    (location) =>
                        location.x === position.x &&
                        location.y === position.y
                );

                return (
                    <div
                        key={index}
                        className={`map-box ${
                            revealedLocation ? "revealed" : "hidden"
                        }`}
                        style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                        }}
                    >
                        {revealedLocation
                            ? revealedLocation.locationName
                            : "?"}
                    </div>
                );
            })}
        </div>
    );
}

export default Map;