// Next.js
import Image from "next/image";

// React
import { useMemo, useState, useCallback } from "react";

// Icons
import { FaCopy } from "react-icons/fa";

// Components
import Snackbar from "@/components/Snackbar";

export default function ServerGraph({
  image,
  name,
  ipAddress,
  currentPlayers,
  maxPlayers,
  totalPlayers,
  pings,
}: Readonly<{
  image: string;
  name: string;
  ipAddress: string;
  currentPlayers: number;
  maxPlayers: number;
  totalPlayers: number;
  pings: Array<{ currentPlayers: number; timestamp: number }>;
}>) {
  // Snackbar
  const [notification, setNotification] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "success"
  );
  const [showSnackbar, setShowSnackbar] = useState(false);

  const closeSnackbar = () => {
    setShowSnackbar(false);
    setNotification(null);
  };

  // Hover state
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverData, setHoverData] = useState<{
    currentPlayers: number;
    timestamp: number;
  } | null>(null);

  // Path Data
  const pathData = useMemo(() => {
    const width = maxPlayers == 0 ? 100 * 5 : pings.length;
    const height = 95;
    const maxPingPlayers = Math.max(
      ...pings.map((p) => p.currentPlayers),
      maxPlayers
    );

    if (maxPingPlayers === 0) return `M0,${height} ${width},${height} Z`;

    const points = pings.map((ping, index) => {
      const x = (index / (pings.length - 1)) * width;
      const y = height - (ping.currentPlayers / maxPingPlayers) * height;
      return `${x},${y}`;
    });

    return `M0,${height} ${points.join(" ")} ${width},${height} Z`;
  }, [pings, maxPlayers]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = maxPlayers == 0 ? 100 * 5 : pings.length;
      const index = Math.round((x / width) * (pings.length - 1));
      const closestData = pings[index];
      setHoverX(x);
      console.log(hoverX);
      setHoverData(closestData);
    },
    [pings]
  );

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverData(null);
  };

  const maxPlayersIndex = pings.findIndex(
    (ping) => ping.currentPlayers === maxPlayers
  );
  const maxPlayersX =
    (maxPlayersIndex / (pings.length - 1)) * (pings.length * 10);

  return (
    <div className="items-left justify-center p-4 bg-[#0f0f10] border border-[#2f2f2f] rounded-lg shadow-lg relative">
      {showSnackbar && (
        <Snackbar
          message={notification || ""}
          type={snackbarType}
          onClose={closeSnackbar}
        />
      )}
      <div className="flex items-center border-b border-[#2f2f2f] pb-4">
        {/* Server Address and Image */}
        <Image
          src={image}
          width={50}
          height={50}
          alt={name}
          className="rounded-lg"
        />
        {/* Copy button */}
        <button
          className="absolute right-4 top-4 text-xl text-gray-400 hover:text-gray-300 focus:outline-none border border-gray-700 hover:border-gray-500 rounded-md p-3
          hover:bg-[#2f2f2f] focus:bg-[#2f2f2f] transition-all duration-200 ease-in-out hover:shadow-lg"
          onClick={() => {
            navigator.clipboard.writeText(ipAddress);
            setNotification("Copied to clipboard!");
            setSnackbarType("success");
            setShowSnackbar(true);
          }}
        >
          <FaCopy />
        </button>

        <div className="ml-3 -mt-1">
          <h1 className="text-md font-semibold text-gray-300">{name}</h1>
          <p className="text-md text-gray-500">{ipAddress}</p>
        </div>
      </div>

      {/* Graph */}
      <div className="flex items-center justify-center border-b border-[#2f2f2f] space-x-2 mt-2 bg-graph-black-dots bg-graph-pattern relative">
        <div className="w-full relative">
          <svg
            className="w-full h-24"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="green" stopOpacity="0.5" />
                <stop offset="100%" stopColor="green" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={pathData}
              fill="url(#gradient)"
              stroke="green"
              strokeWidth="1"
              fillOpacity="0.5"
            />

            {hoverX !== null && hoverData && (
              <>
                <line
                  x1={hoverX}
                  y1="0"
                  x2={hoverX}
                  y2="100%"
                  stroke="gray"
                  strokeDasharray="4"
                />
                <rect
                  x={(hoverX < 200 ? hoverX : hoverX - 190) + 10}
                  y="5"
                  width={150 + (name.length * 8) / 2}
                  height="55"
                  fill="#0f0f10"
                  opacity="0.9"
                  rx="5"
                  stroke="#2f2f2f"
                  strokeWidth="0.5"
                />
                <text
                  x={(hoverX < 200 ? hoverX : hoverX - 190) + 20}
                  y="25"
                  fill="#c6c6c6"
                  fontSize="16"
                  fontFamily="monospace"
                >
                  {new Date(hoverData.timestamp).toLocaleString([], {
                    hour12: false,
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </text>
                <text
                  x={(hoverX < 200 ? hoverX : hoverX - 190) + 20}
                  y="45"
                  fill="white"
                  fontSize="14"
                  fontFamily="monospace"
                >
                  <tspan fill="green">◆ </tspan>
                  <tspan fill="gray">{name}: </tspan>
                  <tspan fill="#c6c6c6">{hoverData.currentPlayers}</tspan>
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="text-center mt-4 lg:text-left lg:flex lg:items-center lg:justify-between">
        {/* Players Info */}
        <div className="text-md text-gray-400 border-b border-[#2f2f2f] pb-3 lg:w-1/2 lg:pb-4">
          Current
          <p className="text-md text-gray-600">{currentPlayers}</p>
        </div>
        <div className="text-md text-gray-400 border-b border-[#2f2f2f] pb-3 lg:w-1/2 lg:pb-4">
          24h Peak
          <p className="text-md text-gray-600">{maxPlayers}</p>
        </div>
        <div className="text-md text-gray-400 border-b border-[#2f2f2f] pb-3 lg:w-1/2 lg:pb-4">
          Highest Players
          <p className="text-md text-gray-600">{totalPlayers}</p>
        </div>
      </div>
    </div>
  );
}
