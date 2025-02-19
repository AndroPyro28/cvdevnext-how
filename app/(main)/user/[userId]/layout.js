import Sidebar from '../../../components/sidebar.js';

export default function Layout({ children, params }) {
    return (
                <Sidebar userId={params.userId}>
                    {children}
                </Sidebar>
           
    );
}