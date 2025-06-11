// // components/Layout.jsx
// import React from 'react';
// import Sidebar from './Sidebar';
// import Navbar from './Navbar';
// import { useLocation } from 'react-router-dom';

// const Layout = ({ children }) => {
//     const location = useLocation();
//     const path = location.pathname;

//     // Check if current path is login or signup
//     const isAuthPage = path === '/login' || path === '/signup' || path === '/';

//     // If on auth pages, render only the children without Sidebar and Navbar
//     if (isAuthPage) {
//         return (
//             <main style={{ width: '100%', height: '100vh' }}>
//                 {children}
//             </main>
//         );
//     }

//     // For all other pages, render the complete layout with Sidebar and Navbar
//     return (
//         <div>
//             <Sidebar />
//             <div >
//                 <Navbar />
//                 <main>
//                     {children}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default Layout;



// components/Layout.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import Loading from './Loading'; // 👈 make sure this is your custom loader component

const Layout = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;

    const [loading, setLoading] = useState(true); // 🔥 control loading state

    useEffect(() => {
        setLoading(true); // Trigger loading on route change

        const timer = setTimeout(() => {
            setLoading(false); // Delay just to simulate loader effect
        }, 700); // ⏱️ adjust this time as you vibe

        return () => clearTimeout(timer); // cleanup timeout
    }, [location]);

    const isAuthPage = path === '/login' || path === '/signup' || path === '/';

    // 🔥 Show loading spinner globally
    if (loading) {
        return <Loading />;
    }

    // 🧿 Auth Pages: Just render the page content (login/signup)
    if (isAuthPage) {
        return (
            <main style={{ width: '100%', height: '100vh' }}>
                {children}
            </main>
        );
    }

    // 🎯 Default Layout: Sidebar + Navbar + Main Content
    return (
        <div>
            <Sidebar />
            <div>
                <Navbar />
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
