import React from 'react';
import { FaCoins, FaGift, FaHistory } from 'react-icons/fa';

const PointsSummary = ({ pointsData, pointsHistory, isLoading }) => {
  // Format date for history items
  const formatHistoryDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate the actual redemption value (10 points = KSh 10)
  const calculateRedemptionValue = (points) => {
    return Math.floor(points / 10) * 10;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100">
        <div className="p-4 md:p-6">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
          
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full mr-3"></div>
            <div>
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-6 w-28 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {[1, 2].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Points history placeholder */}
          <div className="mt-6">
            <div className="h-6 w-36 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100">
      <div className="p-4 md:p-6">
        <div className="flex items-center mb-4">
          <FaGift className="text-purple-600 mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Points Summary</h2>
        </div>

        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <FaCoins className="text-purple-600" size={16} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-xl font-bold text-gray-800">
              {pointsData?.hitty_points || 0} points
            </div>
            <div className="text-sm text-purple-600 font-medium">
              Worth KSh {calculateRedemptionValue(pointsData?.hitty_points || 0)}
            </div>
            {(pointsData?.hitty_points || 0) >= 100 && (
              <div className="text-xs text-green-600 mt-1">
                ✓ Ready to redeem!
              </div>
            )}
            {(pointsData?.hitty_points || 0) < 100 && (pointsData?.hitty_points || 0) > 0 && (
              <div className="text-xs text-orange-500 mt-1">
                Need {100 - (pointsData?.hitty_points || 0)} more to redeem
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Earned this month</span>
            <span className="font-medium text-gray-800">
              {pointsHistory && pointsHistory.length > 0 
                ? pointsHistory
                    .filter(transaction => {
                      const date = new Date(transaction.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             parseInt(transaction.points) > 0;
                    })
                    .reduce((sum, transaction) => sum + parseInt(transaction.points), 0)
                : 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Used this month</span>
            <span className="font-medium text-gray-800">
              {pointsHistory && pointsHistory.length > 0 
                ? pointsHistory
                    .filter(transaction => {
                      const date = new Date(transaction.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             parseInt(transaction.points) < 0;
                    })
                    .reduce((sum, transaction) => sum + Math.abs(parseInt(transaction.points)), 0)
                : 0}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center mb-4">
            <FaHistory className="text-purple-600 mr-2" size={18} />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>

          {pointsHistory && pointsHistory.length > 0 ? (
            <div className="space-y-3">
              {pointsHistory.slice(0, 3).map((transaction, index) => (
                <div key={transaction.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatHistoryDate(transaction.created_at)}
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${parseInt(transaction.points) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseInt(transaction.points) >= 0 ? '+' : ''}{transaction.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <FaGift className="mx-auto text-gray-300 text-2xl mb-2" />
              <p className="text-gray-500 text-sm">No points activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsSummary;