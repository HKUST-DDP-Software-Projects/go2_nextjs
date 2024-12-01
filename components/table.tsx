import { ReactNode, useState } from "react";

type KeyColumn<T> = keyof T | "custom" | "";
type TableProps<T> = {
  data: T[];
  // eslint-disable-next-line no-unused-vars
  keyFunc: (row: T) => string;
  columns: {
    key: KeyColumn<T>;
    header: string;
    // eslint-disable-next-line no-unused-vars
    format?: (value: T) => ReactNode;
  }[];
};

function Table<T>({ data, columns, keyFunc }: TableProps<T>) {
  const [columnKey, setColumnKey] = useState<KeyColumn<T>>("");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sortedData = [...data].sort((a, b) => {
    if (columnKey === "") {
      return 0;
    }

    const column = columns.find((c) => c.key === columnKey);
    if (!column) {
      return 0;
    }

    if (column.key === "custom" || column.key === "") {
      return 0;
    }

    const aValue = a[column.key];
    const bValue = b[column.key];

    if (aValue < bValue) {
      return direction === "asc" ? -1 : 1;
    } else if (aValue > bValue) {
      return direction === "asc" ? 1 : -1;
    } else {
      return 0;
    }
  });

  const handleHeaderClick = (newColumnKey: KeyColumn<T>) => {
    if (columnKey === newColumnKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setColumnKey(newColumnKey);
      setDirection("asc");
    }
  };

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={
                column.key === "custom" ? column.header : (column.key as string)
              }
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleHeaderClick(column.key)}
            >
              {column.header}
              {columnKey === column.key && (
                <span className="ml-2">{direction === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="border px-4 py-2 text-center"
            >
              No data
            </td>
          </tr>
        ) : (
          sortedData.map((row) => (
            <tr key={keyFunc(row)}>
              {columns.map((column) => (
                <td
                  key={
                    column.key === "custom"
                      ? column.header
                      : (column.key as string)
                  }
                  className="border px-4 py-2"
                >
                  {column.format
                    ? column.format(row)
                    : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default Table;
