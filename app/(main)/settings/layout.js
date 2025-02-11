import Sidebar from '../../components/sidebar.js';
export default function Layout({ children }) {
    return (
        <html lang="en">
        <head>
            <title>CV Connect</title>
        </head>
        <body>
        <Sidebar>
            {children}
        </Sidebar>
        </body>
        </html>
    );
}
