import { Star } from "lucide-react";

const MAX_SCORE = 2042;
const MAX_STARS = 5;


export default function StarProgressBar ({ totalScore }) {
    const safeScore = Math.max(0, Number(totalScore) || 0);
    const filledStars = Math.max(0, Math.floor((safeScore / MAX_SCORE) * MAX_STARS));
    const emptyStars = Math.max(0, MAX_STARS - filledStars);

    return (
        <div className="flex items-center gap-4">
            {[...Array(filledStars)].map((_, i) => (
                <div className="star-wrapper" key={`filled-${i}`}>
                    <Star className="star-filled" style={{ width: "10vw", height: "10vw" }} />
                </div>
            ))}
            {[...Array(emptyStars)].map((_, i) => (
                <div className="star-wrapper" key={`empty-${i}`}>
                    <Star className="star-empty" style={{ width: "10vw", height: "10vw" }} />
                </div>
            ))}
        </div>
    );
}
