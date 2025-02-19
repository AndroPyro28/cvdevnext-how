import Sidebar from '../../components/sidebar.js';

export const metadata = {
    title: "CVConnect | Home Owner - Settings",
    description: "Integrated solutions for record management.",
  };

export default function Layout({ children }) {
    return (
     
        <Sidebar>
            {children}
        </Sidebar>
      
    );
}
