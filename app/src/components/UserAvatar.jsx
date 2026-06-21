export default function UserAvatar({ name, className = "" }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const colors = [
    'bg-[#059669]', // emerald-600
    'bg-[#0d9488]', // teal-600
    'bg-[#0891b2]', // cyan-600
    'bg-[#16a34a]', // green-600
    'bg-[#65a30d]'  // lime-600
  ];
  
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`flex items-center justify-center rounded-full text-white font-bold ${colorClass} ${className}`}>
      {initial}
    </div>
  );
}
