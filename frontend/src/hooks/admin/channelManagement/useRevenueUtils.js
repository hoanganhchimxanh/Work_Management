// hooks/admin/channelManagement/useRevenueUtils.js
export const useRevenueUtils = (channelData) => {
  // Hàm format số với 2 chữ số thập phân
  const formatNumber = (num) => {
    return num?.toFixed(2) || "0.00";
  };

  // Hàm tính tỷ lệ views từ Mỹ
  const calculateUsViewsPercentage = (totalViews, usViews) => {
    if (!totalViews || totalViews === 0) return 0;
    return ((usViews / totalViews) * 100).toFixed(2);
  };

  // Hàm tính doanh thu từ Mỹ
  const calculateUsRevenue = (estimatedRevenue, usViewsPercentage) => {
    return (estimatedRevenue * usViewsPercentage) / 100;
  };

  // Hàm tính doanh thu ngoài Mỹ
  const calculateNonUsRevenue = (estimatedRevenue, usRevenue) => {
    return estimatedRevenue - usRevenue;
  };

  // Hàm hiển thị công thức tính
  const getFormulaText = () => {
    if (!channelData?.isMonetized) {
      return <span className="text-muted">Kênh chưa bật kiếm tiền</span>;
    }

    return (
      <div className="formula-container">
        <div className="mb-3">
          <strong>Bước 1: Tính tỷ lệ views từ Mỹ</strong>
          <div className="ms-3 text-muted">
            % Views Mỹ = (Views Mỹ / Tổng Views) × 100%
          </div>
        </div>

        <div className="mb-3">
          <strong>Bước 2: Ước tính doanh thu theo khu vực</strong>
          <div className="ms-3 text-muted">
            • DT Mỹ = DT Ước tính × (% Views Mỹ / 100)
            <br />• DT Ngoài Mỹ = DT Ước tính - DT Mỹ
          </div>
        </div>

        <div className="mb-3">
          <strong>Bước 3: Áp dụng thuế Mỹ</strong>
          <div className="ms-3 text-muted">
            DT Mỹ sau thuế = DT Mỹ × (100% - % Thuế Mỹ)
          </div>
        </div>

        <div className="mb-3">
          <strong>Bước 4: Tính doanh thu thực tế</strong>
          <div className="ms-3">
            <div className="text-success fw-bold">Trường hợp CÓ NETWORK:</div>
            <div className="text-muted">
              DT Thực tế = [(DT Mỹ × (100% - % Thuế Mỹ)) + DT Ngoài Mỹ] × (100%
              - % Net Network - % Thuế TNCN)
            </div>
          </div>
          <div className="ms-3">
            <div className="text-success fw-bold">
              Trường hợp KHÔNG CÓ NETWORK:
            </div>
            <div className="text-muted">
              DT Thực tế = [(DT Mỹ × (100% - % Thuế Mỹ)) + DT Ngoài Mỹ] × (100%
              - % Thuế TNCN)
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-3 mb-0">
          <small>
            <strong>Lưu ý:</strong> Thuế Mỹ chỉ áp dụng cho phần doanh thu từ
            views Mỹ. Doanh thu từ các quốc gia khác không bị đánh thuế Mỹ.
          </small>
        </div>
      </div>
    );
  };

  // Hàm tính ví dụ minh họa
  const getExampleCalculation = (revenue) => {
    if (!revenue || !channelData?.isMonetized) return null;

    const usViewsPercent = revenue.usViewsPercentage || 0;
    const usRev = revenue.usRevenue || 0;
    const nonUsRev = revenue.nonUsRevenue || 0;
    const taxUS = revenue.taxUS || 0;
    const netNetwork = revenue.netNetwork || 0;
    const taxPIT = revenue.taxPIT || 0;

    const usRevAfterTax = usRev * (1 - taxUS / 100);
    const totalRevAfterUsTax = usRevAfterTax + nonUsRev;

    let actualRevenue;
    if (channelData.hasNetwork) {
      actualRevenue = totalRevAfterUsTax * (1 - (netNetwork + taxPIT) / 100);
    } else {
      actualRevenue = totalRevAfterUsTax * (1 - taxPIT / 100);
    }

    return {
      usViewsPercent: formatNumber(usViewsPercent),
      usRevenue: formatNumber(usRev),
      nonUsRevenue: formatNumber(nonUsRev),
      usRevenueAfterTax: formatNumber(usRevAfterTax),
      totalRevenueAfterUsTax: formatNumber(totalRevAfterUsTax),
      actualRevenue: formatNumber(actualRevenue),
    };
  };

  return {
    formatNumber,
    calculateUsViewsPercentage,
    calculateUsRevenue,
    calculateNonUsRevenue,
    getFormulaText,
    getExampleCalculation,
  };
};
