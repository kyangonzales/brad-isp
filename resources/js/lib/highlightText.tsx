// utils/highlightText.tsx

export function highlightText(text: string, query: string) {
    if (!query) return text; // kung walang search, normal lang text

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="rounded bg-yellow-200 px-1 text-black">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}
