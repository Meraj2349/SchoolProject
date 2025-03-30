import ImageCarousel from '../components/imageCarousel';
import Notice from '../components/movingNotice';
import RecentNotices from '../components/recentNotices';
import PrincipalMessage from '../components/principleMessage';
import Footer from '../components/footer';
import TeachersData from '../components/teachersData';
import React from 'react';
function Home() {
    return (
        <div className='bg-zinc-50'>
            <Notice />
            <ImageCarousel />
            <PrincipalMessage />
            <TeachersData />
            <RecentNotices />
            <Footer />
           
        </div>
    );
}

export default Home;
