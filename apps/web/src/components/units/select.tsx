/** Native select for GET filter forms (works without JavaScript). */
export function Select({ name, label, value, options, any }: { name: string; label: string; value: string; options: [string, string][]; any?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold">{label}</span>
      <select name={name} defaultValue={value} className="input mt-1">
        {any && <option value="">{any}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
