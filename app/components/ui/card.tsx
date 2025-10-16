export const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => {
  return <div className={`rounded border bg-white shadow-sm ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => {
  return <div className={`px-4 py-2 border-b ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};