import React from 'react';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (row: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
}

export function Table<T extends { id?: string | number }>({
    columns,
    data,
    onRowClick,
    emptyMessage = 'No data available',
}: TableProps<T>) {
    return (
        <div className="bg-[#1e1a29] border border-[#342f42] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#1e1a29]/50 text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} className={`px-6 py-4 ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#342f42]">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id ?? rowIndex}
                                    className={`hover:bg-white/[0.02] ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                                            {col.render
                                                ? col.render(row)
                                                : String(row[col.key as keyof T] ?? '')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
