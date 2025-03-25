// AppLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import "../App.css"
import Footer from '@/components/Footer';

function AppLayout() {
  return (
    <div>
      <div className='grid-background'></div>
      <main className='min-h-screen container'>
        <Header />
<Outlet />
<Footer/>    

</main> 
    
    </div>
  );
}

export default AppLayout;