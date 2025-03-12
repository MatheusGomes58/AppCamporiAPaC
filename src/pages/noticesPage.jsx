import React from 'react';
import '../css/noticesPage.css';
import NoticeWidgets from '../components/notices/notices'

const App = () => {
  return (
    <div className='notices'>
      <div className='noticeCard'>
      <NoticeWidgets/>
      </div>
    </div>
  );
};

export default App;
