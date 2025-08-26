import React, { useState, useEffect } from "react";
import {
  getAllNotesAdmin,
  approveNote,
  denyNote,
  updateNote,
  getUsersWithPendingNotes,
  approveNoteForUser,
  denyNoteForUser,
} from "../../services/adminService";
import { getApprovedNotesDetails } from "../../services/notesService";
import Navbar from "../../Components/Navbar";

function AdminPanel() {
  const [view, setView] = useState("notes");

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesActionLoading, setNotesActionLoading] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    branch: "",
    year: "",
    semester: "",
    driveLink: "",
  });

  const [driveLinkEdits, setDriveLinkEdits] = useState({});
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(true);
  const [pendingActionLoading, setPendingActionLoading] = useState(null);
  const [pendingNotesDetails, setPendingNotesDetails] = useState({});

  const fetchNotes = async () => {
    setNotesLoading(true);
    const { notes: allNotes } = await getAllNotesAdmin();
    setNotes(allNotes || []);
    setNotesLoading(false);
    setDriveLinkEdits({});
  };

  const fetchPendingUsers = async () => {
    setPendingUsersLoading(true);
    const { users } = await getUsersWithPendingNotes();
    setPendingUsers(users || []);

    const allPendingNoteIds = users.flatMap((user) =>
      (user.pendingNotes || []).map((pendingNote) =>
        typeof pendingNote === "object" ? pendingNote.noteId : pendingNote
      )
    );
    const uniqueNoteIds = [...new Set(allPendingNoteIds)];

    if (uniqueNoteIds.length > 0) {
      const { notes } = await getApprovedNotesDetails(uniqueNoteIds);
      const notesMap = {};
      notes.forEach((note) => {
        notesMap[note.id] = note;
      });
      setPendingNotesDetails(notesMap);
    }

    setPendingUsersLoading(false);
  };

  useEffect(() => {
    if (view === "notes") {
      fetchNotes();
    } else {
      fetchPendingUsers();
    }
  }, [view]);

  // Notes handlers
  const handleEditClick = (note) => {
    setEditingNote(note);
    setEditForm({
      title: note.title || "",
      subject: note.subject || "",
      branch: note.branch || "",
      year: note.year || "",
      semester: note.semester || "",
      driveLink: note.driveLink || "",
    });
  };

  const handleEditSave = async () => {
    if (!editingNote) return;
    setNotesActionLoading(editingNote.id);

    const payload = {
      title: editForm.title.trim(),
      subject: editForm.subject.trim(),
      branch: editForm.branch.trim(),
      year: editForm.year.trim(),
      semester: editForm.semester.trim(),
      driveLink: editForm.driveLink.trim(),
      updatedAt: new Date(),
    };

    const { error } = await updateNote(editingNote.id, payload);
    if (!error) {
      await fetchNotes();
      setEditingNote(null);
    }
    setNotesActionLoading(null);
  };

  const handleApproveNote = async (noteId) => {
    setNotesActionLoading(noteId);
    const { error } = await approveNote(noteId);
    if (!error) {
      await fetchNotes();
    }
    setNotesActionLoading(null);
  };

  const handleDenyNote = async (noteId) => {
    const reason = prompt("Enter denial reason (optional):");
    setNotesActionLoading(noteId);
    const { error } = await denyNote(noteId, reason);
    if (!error) {
      await fetchNotes();
    }
    setNotesActionLoading(null);
  };

  const handleDriveLinkChange = (noteId, value) => {
    setDriveLinkEdits((prev) => ({ ...prev, [noteId]: value }));
  };

  // Access handlers
  const handleApproveUserNote = async (userId, pendingNoteObject) => {
    const actionKey = `${userId}-${pendingNoteObject.noteId}`;
    setPendingActionLoading(actionKey);
    const { error } = await approveNoteForUser(userId, pendingNoteObject);
    if (!error) {
      await fetchPendingUsers();
    }
    setPendingActionLoading(null);
  };

  const handleDenyUserNote = async (userId, pendingNoteObject) => {
    const actionKey = `${userId}-${pendingNoteObject.noteId}`;
    setPendingActionLoading(actionKey);
    const { error } = await denyNoteForUser(userId, pendingNoteObject);
    if (!error) {
      await fetchPendingUsers();
    }
    setPendingActionLoading(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded",
      approved: "bg-green-100 text-green-800 px-2 py-1 rounded",
      "access denied": "bg-red-100 text-red-800 px-2 py-1 rounded",
    };
    return badges[status] || "bg-gray-100 text-gray-800 px-2 py-1 rounded";
  };

  const tableClassName =
    "min-w-full border-collapse border border-gray-300 text-xs sm:text-sm";
  const thClassName =
    "border border-gray-300 p-2 sm:p-3 bg-[#0A1F44] text-white text-left font-semibold";
  const tdClassName = "border border-gray-300 p-2 sm:p-3";

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto mt-14">
        <div className="mb-6 flex justify-center">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border border-[#0A1F44] rounded px-3 sm:px-4 py-2 text-sm sm:text-lg text-[#0A1F44] font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#16335B]"
            aria-label="Select admin panel view"
          >
            <option value="notes">Notes Upload Requests</option>
            <option value="access">User Purchase Approvals</option>
          </select>
        </div>

        {/* Notes Upload Requests */}
        {view === "notes" && (
          <section className="bg-white rounded shadow p-4 sm:p-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#0A1F44]">
              Notes Upload Requests
            </h2>

            {editingNote && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                <div className="bg-white p-4 sm:p-6 rounded shadow-lg w-full max-w-md">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#0A1F44]">
                    Edit Note
                  </h3>
                  {[
                    "title",
                    "subject",
                    "branch",
                    "year",
                    "semester",
                    "driveLink",
                  ].map((field) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={editForm[field]}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [field]: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2 mb-2 sm:mb-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                    />
                  ))}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={notesActionLoading === editingNote.id}
                      className="w-full sm:w-auto px-4 py-2 bg-[#0A1F44] text-white rounded hover:bg-[#16335B] transition disabled:opacity-50"
                    >
                      {notesActionLoading === editingNote.id
                        ? "Saving..."
                        : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {notesLoading ? (
              <p className="text-center text-gray-600">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-center text-gray-600">
                No notes uploaded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>Title</th>
                      <th className={thClassName}>Subject</th>
                      <th className={thClassName}>Branch</th>
                      <th className={thClassName}>Year / Semester</th>
                      <th className={thClassName}>Uploader Info</th>
                      <th className={thClassName}>Status</th>
                      <th className={thClassName}>Submitted</th>
                      <th className={thClassName}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr
                        key={note.id}
                        className="hover:bg-[#e1e7f0] transition"
                      >
                        <td className={tdClassName}>{note.title}</td>
                        <td className={tdClassName}>{note.subject}</td>
                        <td className={tdClassName}>{note.branch}</td>
                        <td className={tdClassName}>
                          {note.year} / {note.semester}
                        </td>
                        <td className={tdClassName}>
                          <div className="text-xs">
                            <p>
                              <strong>Name:</strong>{" "}
                              {note.uploaderName || "Anonymous"}
                            </p>
                            {note.uploaderCGPA && (
                              <p>
                                <strong>CGPA:</strong>
                                <span
                                  className={`ml-1 font-semibold ${
                                    note.uploaderCGPA >= 8.5
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {note.uploaderCGPA}
                                </span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className={tdClassName}>
                          <span className={getStatusBadge(note.status)}>
                            {note.status}
                          </span>
                        </td>
                        <td className={tdClassName}>
                          {note.createdAt?.toDate
                            ? new Date(
                                note.createdAt.toDate()
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className={`${tdClassName} space-x-2 sm:space-x-3`}>
                          {note.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveNote(note.id)}
                                disabled={notesActionLoading === note.id}
                                className="text-green-700 text-xs sm:text-sm hover:underline disabled:opacity-50"
                              >
                                {notesActionLoading === note.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDenyNote(note.id)}
                                disabled={notesActionLoading === note.id}
                                className="text-red-700 text-xs sm:text-sm hover:underline disabled:opacity-50"
                              >
                                Deny
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditClick(note)}
                            className="text-[#0A1F44] text-xs sm:text-sm hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* User Purchase Approvals */}
        {view === "access" && (
          <section className="bg-white rounded shadow p-4 sm:p-6 mt-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#0A1F44]">
              User Purchase Approvals
            </h2>

            {pendingUsersLoading ? (
              <p className="text-center text-gray-600">
                Loading pending approvals...
              </p>
            ) : pendingUsers.length === 0 ? (
              <p className="text-center text-gray-600">
                No pending approvals at the moment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>User Email</th>
                      <th className={thClassName}>Display Name</th>
                      <th className={thClassName}>Payment ID</th>
                      <th className={thClassName}>Pending Notes</th>
                      <th className={thClassName}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#e1e7f0] transition"
                      >
                        <td className={tdClassName}>{user.email}</td>
                        <td className={tdClassName}>{user.displayName}</td>
                        <td className={tdClassName}>
                          <div className="space-y-1">
                            {user.pendingNotes.map((pendingNote, index) => {
                              const paymentId =
                                typeof pendingNote === "object"
                                  ? pendingNote.paymentId
                                  : "N/A";
                              return (
                                <div
                                  key={index}
                                  className="text-[10px] sm:text-xs font-mono bg-gray-100 px-2 py-1 rounded"
                                >
                                  {paymentId}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className={tdClassName}>
                          <div className="space-y-2">
                            {user.pendingNotes.map((pendingNote, index) => {
                              const noteId =
                                typeof pendingNote === "object"
                                  ? pendingNote.noteId
                                  : pendingNote;
                              const paymentId =
                                typeof pendingNote === "object"
                                  ? pendingNote.paymentId
                                  : "N/A";
                              const purchasedAt =
                                typeof pendingNote === "object"
                                  ? pendingNote.purchasedAt
                                  : null;
                              const note = pendingNotesDetails[noteId];
                              const actionKey = `${user.id}-${noteId}`;
                              return (
                                <div
                                  key={index}
                                  className="border rounded p-2 bg-gray-50"
                                >
                                  <p className="font-medium text-xs sm:text-sm">
                                    {note?.title || `Note ID: ${noteId}`}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-600">
                                    {note?.subject} - {note?.branch}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-blue-600 font-mono">
                                    Payment: {paymentId}
                                  </p>
                                  {purchasedAt && (
                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                      Purchased:{" "}
                                      {new Date(
                                        purchasedAt.toDate
                                          ? purchasedAt.toDate()
                                          : purchasedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        handleApproveUserNote(
                                          user.id,
                                          pendingNote
                                        )
                                      }
                                      disabled={
                                        pendingActionLoading === actionKey
                                      }
                                      className="text-[10px] sm:text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                      {pendingActionLoading === actionKey
                                        ? "..."
                                        : "Approve"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDenyUserNote(user.id, pendingNote)
                                      }
                                      disabled={
                                        pendingActionLoading === actionKey
                                      }
                                      className="text-[10px] sm:text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                      {pendingActionLoading === actionKey
                                        ? "..."
                                        : "Deny"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className={`${tdClassName} text-xs sm:text-sm`}>
                          {user.pendingNotes.length} pending note(s)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
