import Sidebar from '../../../components/sidebar.js';

export default function Layout({ children, params }) {
    return (
        <html lang="en">
            <head>
                <title>CV Connect</title>
            </head>
            <body>
                <Sidebar userId={params.userId}>
                    {children}
                </Sidebar>
            </body>
        </html>
    );
}
