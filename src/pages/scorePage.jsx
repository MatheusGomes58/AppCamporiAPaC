import React from 'react';
import '../css/scorePage.css';

function ScorePage() {
    return (
        <div className="ScorePage">
            <iframe 
                src="https://apac.campori.app" // Substitua pelo URL desejado
                title="Full Page Iframe"
                style={{ width: '100%', height: '93vh', border: 'none' }}
            ></iframe>
        </div>
    );
}

export default ScorePage;
