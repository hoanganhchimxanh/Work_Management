// hooks/admin/channelManagement/useRevenueUtils.js
export const useRevenueUtils = (channelData) => {
  const getDeductionInfo = (rev) => {
    if (channelData?.hasNetwork) {
      return { value: rev.netNetwork, label: "Net Network" };
    } else {
      return { value: rev.taxUS, label: "Thuế Mỹ" };
    }
  };

  const getDeductionFieldName = () => {
    return channelData?.hasNetwork ? "netNetwork" : "taxUS";
  };

  const getFormulaText = () => {
    if (!channelData?.isMonetized) {
      return <span>Kênh chưa bật kiếm tiền</span>;
    }

    return (
      <>
        <div>
          • <strong>Trường hợp có Network:</strong>
          <br />
          DT Thực tế = DT Ước tính × (100% − Net Network − Thuế TNCN)
        </div>

        <div className="mt-2">
          • <strong>Trường hợp không có Network:</strong>
          <br />
          DT Thực tế = DT Ước tính × (100% − Thuế Mỹ − Thuế TNCN)
        </div>
      </>
    );
  };

  return {
    getDeductionInfo,
    getDeductionFieldName,
    getFormulaText,
  };
};
