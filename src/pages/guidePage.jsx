import React, { useEffect, useState, memo } from 'react';
import '../css/guidePage.css';
import imageGuidePage from '../img/imageGuidePage.jpg';
import guideData from '../data/guideData.json';

// Custom hook to fetch guides
const useGuides = () => {
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        setGuides(guideData);
    }, []);

    return guides;
};

// Memoized Guide component for better performance
const Guide = memo(({ guide }) => (
    <details className='guide'>
        <summary className='guideTitle'>{guide.title}</summary>
        <div className='guideData'>
            {guide.description.map((desc, i) => (
                <p key={i} className='guideDescription'>{desc}</p>
            ))}
        </div>
    </details>
));

function GuidePage() {
    const guides = useGuides();

    return (
        <div className="GuidePage">
            <h2>GUIA DE ORIENTAÇÕES GERAIS DO EVENTO</h2>
            <div className='guidesSection'>
                {guides.map((guide, index) => (
                    <Guide key={index} guide={guide} />
                ))}
            </div>
        </div>
    );
}

export default GuidePage;
