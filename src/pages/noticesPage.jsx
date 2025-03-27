import React from 'react';
import '../css/noticesPage.css';
import NoticeWidgets from '../components/notices/notices'

const App = ({ email, uid, admin, name, isMaster }) => {
  return (
    <div className='notices'>
      <div className='noticeCard'>
        <NoticeWidgets
          isMaster={isMaster}
          email={email}
          uid={uid}
          admin={admin}
          name={name}
        />
      </div>
    </div>
  );
};

export default App;
