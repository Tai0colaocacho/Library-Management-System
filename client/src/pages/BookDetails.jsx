import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../layout/Header";

const BookDetails = () => {
    const { id } = useParams();
    const { books } = useSelector((state) => state.book);

    const selectedBook = books.find((book) => book._id === id);

    if (!selectedBook) {
        return <p className="p-6 text-red-600">Book not found</p>;
    }

    const seriesTitle = selectedBook.series || selectedBook.title;
    const normalizedSeries = seriesTitle.toLowerCase().trim();

    const booksInSeries = books.filter((b) => {
        if (b._id === selectedBook._id) return true;
        return (
            (b.series && b.series.toLowerCase().trim() === normalizedSeries) ||
            b.title.toLowerCase().startsWith(normalizedSeries)
        );
    });

    booksInSeries.sort((a, b) => a.title.localeCompare(b.title, "vi"));

    return (
        <main className="relative flex-1 p-6 pt-28">
            <Header />
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                    <img
                        src={selectedBook.coverImage}
                        alt={selectedBook.title}
                        className="w-full rounded-lg shadow"
                    />
                </div>
                <div className="md:w-2/3">
                    <h2 className="text-2xl font-semibold mb-4">Books in "{seriesTitle}"</h2>
                    <ul className="space-y-3">
                        {booksInSeries.map((book) => (
                            <li
                                key={book._id}
                                className={`p-3 border rounded-md ${book._id === selectedBook._id ? "bg-blue-50 border-blue-400" : ""
                                    }`}
                            >
                                <p className="font-medium">{book.title}</p>
                                <p className="text-sm text-gray-600">Author: {book.author}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default BookDetails;
