import Sidebar from '../../components/sidebar.js';
export default function Layout({ children }) {
    return (
     
        <Sidebar>
            {children}
        </Sidebar>
      
    );
}
