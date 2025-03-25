import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#141414'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="sorry, the page you visited does not exist."
        extra={
          <Link to="/">
            <Button type="primary">back to homepage</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;