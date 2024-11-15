import React from 'react';

const Main: React.FC = () => {
    return (
        <main className="bg-gray-300 flex-1 p-3 overflow-hidden">
            <div className="flex flex-col">
                {/* Stats Row */}
                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">
                    <div className="shadow-lg bg-red-500 border-l-8 hover:bg-red-600 border-red-700 mb-2 p-2 md:w-1/4 mx-2">
                        <div className="p-4 flex flex-col">
                            <a href="#" className="no-underline text-white text-2xl">
                                $244
                            </a>
                            <a href="#" className="no-underline text-white text-lg">
                                Total Sales
                            </a>
                        </div>
                    </div>

                    <div className="shadow bg-blue-500 border-l-8 hover:bg-blue-600 border-blue-700 mb-2 p-2 md:w-1/4 mx-2">
                        <div className="p-4 flex flex-col">
                            <a href="#" className="no-underline text-white text-2xl">
                                $199.4
                            </a>
                            <a href="#" className="no-underline text-white text-lg">
                                Total Cost
                            </a>
                        </div>
                    </div>

                    <div className="shadow bg-yellow-500 border-l-8 hover:bg-yellow-600 border-yellow-700 mb-2 p-2 md:w-1/4 mx-2">
                        <div className="p-4 flex flex-col">
                            <a href="#" className="no-underline text-white text-2xl">
                                900
                            </a>
                            <a href="#" className="no-underline text-white text-lg">
                                Total Users
                            </a>
                        </div>
                    </div>

                    <div className="shadow bg-green-500 border-l-8 hover:bg-green-600 border-green-700 mb-2 p-2 md:w-1/4 mx-2">
                        <div className="p-4 flex flex-col">
                            <a href="#" className="no-underline text-white text-2xl">
                                500
                            </a>
                            <a href="#" className="no-underline text-white text-lg">
                                Total Products
                            </a>
                        </div>
                    </div>
                </div>
                {/* /Stats Row Ends Here */}

                {/* Card Section Starts Here */}
                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">
                    <div className="rounded overflow-hidden shadow bg-white mx-2 w-full">
                        <div className="px-6 py-2 border-b border-gray-300">
                            <div className="font-bold text-xl">Trending Categories</div>
                        </div>
                        <div className="table-responsive">
                            <table className="table text-gray-800 w-full">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Item</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Current</th>
                                        <th scope="col">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>
                                            <button className="bg-blue-500 hover:bg-blue-800 text-white font-light py-1 px-2 rounded-full">
                                                Twitter
                                            </button>
                                        </td>
                                        <td>4500</td>
                                        <td>4600</td>
                                        <td>
                                            <span className="text-green-500">
                                                <i className="fas fa-arrow-up"></i> 5%
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-light py-1 px-2 rounded-full">
                                                Facebook
                                            </button>
                                        </td>
                                        <td>10000</td>
                                        <td>3000</td>
                                        <td>
                                            <span className="text-red-500">
                                                <i className="fas fa-arrow-down"></i> 65%
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>
                                            <button className="bg-green-500 hover:bg-green-600 text-white font-light py-1 px-2 rounded-full">
                                                Amazon
                                            </button>
                                        </td>
                                        <td>10000</td>
                                        <td>3000</td>
                                        <td>
                                            <span className="text-red-500">
                                                <i className="fas fa-arrow-down"></i> 65%
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">4</th>
                                        <td>
                                            <button className="bg-blue-500 hover:bg-blue-800 text-white font-light py-1 px-2 rounded-full">
                                                Microsoft
                                            </button>
                                        </td>
                                        <td>10000</td>
                                        <td>3000</td>
                                        <td>
                                            <span className="text-green-500">
                                                <i className="fas fa-arrow-up"></i> 65%
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2 mt-2">
                    <div className="rounded overflow-hidden shadow bg-white mx-2 w-full pt-2">
                        <div className="px-6 py-2 border-b border-gray-300">
                            <div className="font-bold text-xl">Progress Among Projects</div>
                        </div>
                        <div>
                            <div className="w-full">
                                <div className="shadow w-full bg-gray-200">
                                    <div
                                        className="bg-blue-500 text-xs leading-none py-1 text-center text-white"
                                        style={{ width: '45%' }}
                                    >
                                        45%
                                    </div>
                                </div>

                                <div className="shadow w-full bg-gray-200 mt-2">
                                    <div
                                        className="bg-teal-500 text-xs leading-none py-1 text-center text-white"
                                        style={{ width: '55%' }}
                                    >
                                        55%
                                    </div>
                                </div>

                                <div className="shadow w-full bg-gray-200 mt-2">
                                    <div
                                        className="bg-orange-500 text-xs leading-none py-1 text-center text-white"
                                        style={{ width: '65%' }}
                                    >
                                        65%
                                    </div>
                                </div>

                                <div className="shadow w-full bg-gray-300 mt-2">
                                    <div
                                        className="bg-red-800 text-xs leading-none py-1 text-center text-white"
                                        style={{ width: '75%' }}
                                    >
                                        75%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2 p-1 mt-2 justify-between">
                    {/* Top user card */}
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="rounded-t-lg overflow-hidden shadow max-w-xs my-3 bg-white">
                            <img src="https://i.imgur.com/w1Bdydo.jpg" alt="" className="w-full" />
                            <div className="flex justify-center -mt-8">
                                <img
                                    src="https://i.imgur.com/8Km9tLL.jpg"
                                    alt=""
                                    className="rounded-full border-solid border-white border-2 -mt-3"
                                />
                            </div>
                            <div className="text-center px-3 pb-6 pt-2">
                                <h3 className="text-black text-sm font-bold">Olivia Dunham</h3>
                                <p className="mt-2 font-light text-gray-700">
                                    Hello, I'm from the other side!
                                </p>
                            </div>
                            <div className="flex justify-center pb-3 text-gray-600">
                                <div className="text-center mr-3 border-r pr-3">
                                    <h2>34</h2>
                                    <span>Photos</span>
                                </div>
                                <div className="text-center">
                                    <h2>42</h2>
                                    <span>Friends</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Main;