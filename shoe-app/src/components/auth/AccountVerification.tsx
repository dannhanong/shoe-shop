import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { verifyAccount } from '../../services/auth.service';

const AccountVerification: React.FC = () => {
  const [status, setStatus] = useState<'success' | 'failed' | null>(null);
  const location = useLocation();

  const handleAccountVerification = async (code: string) => {
    try {
      const response = await verifyAccount(code);

      if (response.status === 200) {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setStatus('failed');
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    handleAccountVerification(queryParams.get('code') || '');
  }, [location]);

  return (
    <div>
      {status === 'success' && 
        <div>
            <h1>Chúc mừng bạn đã verify thành công!</h1>
            <Link to='/login'>Chuyển đến trang đăng nhập</Link>
        </div>
      }
      {status === 'failed' && 
        <div>
            <h1>Tài khoản đã xác thực rồi.</h1>
            <Link to='/'>Chuyển đến trang chủ</Link>
        </div>
      }
      {!status && <p>Đang kiểm tra...</p>}
    </div>
  );
};

export default AccountVerification;