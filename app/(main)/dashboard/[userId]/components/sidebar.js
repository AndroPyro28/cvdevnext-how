import Image from "next/image";
import Link from "next/link";

// styles
import compstyle from '@/app/components.module.css';

// assets
import sblogo from "@/public/svg/sidebar_logo.svg";
import dashIcon from "@/public/svg/dashboard_icon.svg";
import propIcon from "@/public/svg/properties_icon.svg";
import accoIcon from "@/public/svg/accounts_icon.svg";
import wallIcon from "@/public/svg/wallet_icon.svg";
import tranIcon from "@/public/svg/transactions_icon.svg";
import votiIcon from "@/public/svg/voting_icon.svg";
import annoIcon from "@/public/svg/announcements_icon.svg";
import repoIcon from "@/public/svg/reports_icon.svg";

export default function DashboardSidebar() {
    return (
        <div className={compstyle.main_sidebar_container}>
                <div className={compstyle.sidebar_logo_div}>
                    <Image className={compstyle.sidebar_logo} src={sblogo} alt="CV Connect Logo" height={50} />
                </div>



                <div className={compstyle.sidebar_nav_div}>
                    <nav className={compstyle.navlist_div}>
                        <ul className={compstyle.navlist}>
                            <li>
                                <Link href="/dashboard">
                                    <div className={`${compstyle.navlist_item} ${compstyle.navlist_item_active}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={dashIcon} alt="Dashboard Icon" height={25} />
                                        </div>
                                        <p>Dashboard</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/properties">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={propIcon} alt="Properties Icon" height={25} />
                                        </div>
                                        <p>Properties</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/accounts">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={accoIcon} alt="Accounts Icon" height={25} />
                                        </div>
                                        <p>Accounts</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/wallet">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={wallIcon} alt="Wallet Icon" height={25} />
                                        </div>
                                        <p>Wallet</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/transactions">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={tranIcon} alt="Transactions Icon" height={25} />
                                        </div>
                                        <p>Transactions</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/voting-polls">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={votiIcon} alt="Voting Icon" height={25} />
                                        </div>
                                        <p>Voting Polls</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/announcements">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={annoIcon} alt="Announcements Icon" height={25} />
                                        </div>
                                        <p>Announcements</p>
                                    </div>
                                </Link>
                            </li>

                            <li>
                                <Link href="/reports">
                                    <div className={`${compstyle.navlist_item}`}>
                                        <div className={compstyle.navlist_item_ico}>
                                            <Image src={repoIcon} alt="Reports Icon" height={25} />
                                        </div>
                                        <p>Reports</p>
                                    </div>
                                </Link>
                            </li>
                        </ul>

                    </nav>
                </div>



                <div className={compstyle.sidebar_ver_div}>
                    <p className={compstyle.sidebar_ver}>ADMIN PORTAL v1.0.0</p>
                </div>
            </div>
    )
}