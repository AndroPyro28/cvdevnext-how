import Sidebar from '../../../components/sidebar.js';

export const metadata = {
    title: "CVConnect | Home Owner - User",
    description: "Integrated solutions for record management.",
  };
export default function Layout({ children, params }) {
    return (
                <Sidebar userId={params.userId}>
                    {children}
                </Sidebar>
           
    );
}