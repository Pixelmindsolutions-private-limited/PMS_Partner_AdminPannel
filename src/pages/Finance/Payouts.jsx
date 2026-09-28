import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { payoutsData } from "../../data/payments";

function Payouts() {
  const [payouts, setPayouts] = useState(payoutsData);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  const handleProcess = (payout) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const confirmProcess = () => {
    setPayouts((current) => current.map((item) => item.id === selectedPayout.id ? { ...item, status: "Processing" } : item));
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" description="Review partner settlement requests and payout processing state." />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Payout ID</th>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Bank</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Requested</th>
                <th className="px-4 py-3 font-semibold">Processed</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{payout.id}</td>
                  <td className="px-4 py-3">{payout.partner}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{payout.amount}</td>
                  <td className="px-4 py-3">{payout.bank}</td>
                  <td className="px-4 py-3">{payout.accountNumber}</td>
                  <td className="px-4 py-3">{payout.requestedDate}</td>
                  <td className="px-4 py-3">{payout.processedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={payout.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleProcess(payout)}>Process</Button>
                      <Button variant="success" onClick={() => setPayouts((current) => current.map((item) => item.id === payout.id ? { ...item, status: "Paid" } : item))}>Mark Paid</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Confirm Payout Processing" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to process payout for <span className="font-semibold text-gray-800">{selectedPayout?.partner}</span> for <span className="font-semibold text-gray-800">{selectedPayout?.amount}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={confirmProcess}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Payouts;
