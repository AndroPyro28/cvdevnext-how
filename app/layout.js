import Provider from './components/providers';
import './globals.css';
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
            <Provider>
                {children}
            </Provider>
            </body>
        </html>
    );
}
