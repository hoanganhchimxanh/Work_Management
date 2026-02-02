import { useMemo } from "react";

/**
 * Hook để format số và tạo công thức tính doanh thu
 */
export const useRevenueUtils = (channelData) => {
  // Format số với 2 chữ số thập phân
  const formatNumber = (num) => {
    if (!num && num !== 0) return "-";
    return Number(num).toFixed(2);
  };

  const getFormulaText = () => {
    const hasNetwork = channelData?.hasNetwork;

    return (
      <div className="small">
        <div className="mb-3">
          <strong>📌 Lưu ý quan trọng:</strong>
          <ul className="mt-2 mb-0">
            <li>
              <strong>Doanh thu từ Mỹ (US Revenue)</strong> được lấy{" "}
              <span className="text-primary fw-bold">
                TRỰC TIẾP từ YouTube API
              </span>
            </li>
            <li>
              <strong>Doanh thu ngoài Mỹ (Non-US Revenue)</strong> = Tổng DT -
              DT từ Mỹ
            </li>
          </ul>
        </div>

        <div className="bg-light p-3 rounded">
          <div className="mb-3">
            <strong className="text-info">
              Bước 1: Tính doanh thu ngoài Mỹ
            </strong>
            <div className="ms-3 mt-2">
              <code className="d-block bg-white p-2 rounded border">
                DT Ngoài Mỹ = Tổng DT Ước tính - DT từ Mỹ (API)
              </code>
            </div>
          </div>

          <div>
            <strong className="text-success">
              Bước 2: Tính doanh thu thực tế
            </strong>
            <div className="ms-3 mt-2">
              {hasNetwork ? (
                <>
                  <div className="text-muted mb-2">
                    <em>
                      <i className="bi bi-diagram-3 me-1"></i>
                      Kênh có Network (MCN):
                    </em>
                  </div>
                  <code className="d-block bg-white p-2 rounded border">
                    DT Thực tế = <br />
                    &nbsp;&nbsp;[ (DT từ Mỹ × (100% - %Thuế Mỹ)) + DT Ngoài Mỹ ]{" "}
                    <br />
                    &nbsp;&nbsp;× (100% - %Net Network - %Thuế TNCN)
                  </code>
                </>
              ) : (
                <>
                  <div className="text-muted mb-2">
                    <em>
                      <i className="bi bi-person me-1"></i>
                      Kênh không có Network:
                    </em>
                  </div>
                  <code className="d-block bg-white p-2 rounded border">
                    DT Thực tế = <br />
                    &nbsp;&nbsp;[ (DT từ Mỹ × (100% - %Thuế Mỹ)) + DT Ngoài Mỹ ]{" "}
                    <br />
                    &nbsp;&nbsp;× (100% - %Thuế TNCN)
                  </code>
                  <br />
                  <div className="text-muted mb-2">
                    <em>
                      <i className="bi bi-person me-1"></i>
                      Kênh có Network:
                    </em>
                  </div>
                  <code className="d-block bg-white p-2 rounded border">
                    DT Thực tế = <br />
                    &nbsp;&nbsp;[ (DT từ Mỹ × (100% - %Thuế Mỹ)) + DT Ngoài Mỹ ]{" "}
                    <br />
                    &nbsp;&nbsp;× (100% - %Net network - %Thuế TNCN)
                  </code>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-muted">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            Tất cả các giá trị doanh thu đều tự động được tính toán khi bạn đồng
            bộ từ Analytics hoặc thay đổi các tham số khấu trừ.
          </small>
        </div>
      </div>
    );
  };

  return useMemo(
    () => ({
      formatNumber,
      getFormulaText,
    }),
    [channelData],
  );
};
