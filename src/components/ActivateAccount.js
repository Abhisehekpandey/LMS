import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const activateUser = () => {
      try {
        // Get stored invites
        const invites = JSON.parse(localStorage.getItem('pendingInvites') || '{}');
        const userEmail = invites[token];

        if (!userEmail) {
          setStatus('invalid');
          return;
        }

        // Get users and update status
        const users = JSON.parse(localStorage.getItem('dashboardRows') || '[]');
        const updatedUsers = users.map(user => 
          user.email === userEmail ? { ...user, status: 'active' } : user
        );

        // Save updated users
        localStorage.setItem('dashboardRows', JSON.stringify(updatedUsers));

        // Remove used invite
        delete invites[token];
        localStorage.setItem('pendingInvites', JSON.stringify(invites));

        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        console.error('Activation error:', error);
        setStatus('error');
      }
    };

    activateUser();
  }, [token, navigate]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {status === 'processing' && (
        <>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Activating your account...</Typography>
        </>
      )}
      {status === 'success' && (
        <Typography color="success.main">
          Account activated successfully! Redirecting to login...
        </Typography>
      )}
      {status === 'invalid' && (
        <Typography color="error">
          Invalid or expired activation link.
        </Typography>
      )}
      {status === 'error' && (
        <Typography color="error">
          Error activating account. Please try again or contact support.
        </Typography>
      )}
    </Box>
  );
};

export default ActivateAccount;





// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Box, Typography, CircularProgress } from '@mui/material';

// const ActivateAccount = () => {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [status, setStatus] = useState('processing');

//   useEffect(() => {
//     const activateUser = () => {
//       try {
//         const invites = JSON.parse(localStorage.getItem('pendingInvites') || '{}');
//         if (!invites[token]) {
//           setStatus('invalid');
//           return;
//         }

//         const userEmail = invites[token].email;
//         const rows = JSON.parse(localStorage.getItem('dashboardRows') || '[]');
        
//         const updatedRows = rows.map(user => 
//           user.email === userEmail ? { ...user, status: 'active' } : user
//         );

//         localStorage.setItem('dashboardRows', JSON.stringify(updatedRows));
        
//         // Remove used invite
//         delete invites[token];
//         localStorage.setItem('pendingInvites', JSON.stringify(invites));
        
//         setStatus('success');
//         setTimeout(() => navigate('/login'), 3000);
//       } catch (error) {
//         console.error('Activation error:', error);
//         setStatus('error');
//       }
//     };

//     activateUser();
//   }, [token, navigate]);

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
//       {status === 'processing' && (
//         <>
//           <CircularProgress />
//           <Typography sx={{ mt: 2 }}>Activating your account...</Typography>
//         </>
//       )}
//       {status === 'success' && (
//         <Typography color="success.main">Account activated successfully! Redirecting...</Typography>
//       )}
//       {status === 'invalid' && (
//         <Typography color="error">Invalid or expired activation link.</Typography>
//       )}
//       {status === 'error' && (
//         <Typography color="error">Error activating account. Please try again.</Typography>
//       )}
//     </Box>
//   );
// };

// export default ActivateAccount;