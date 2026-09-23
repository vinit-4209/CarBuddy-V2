export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-rise">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-mist-100 text-ink-500 flex items-center justify-center mb-4">
          <Icon size={24} />
        </div>
      )}
      <h3 className="font-display font-semibold text-ink-900 text-lg">{title}</h3>
      {description && <p className="text-ink-500 text-sm mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
