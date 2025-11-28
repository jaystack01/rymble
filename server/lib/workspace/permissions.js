function isOwner(member) {
  return member && member.role === "owner";
}

function isMember(member) {
  return member && member.role === "member";
}

// OWNER ONLY
function canRemoveMember(requestingMember) {
  return isOwner(requestingMember);
}

function canManageWorkspace(requestingMember) {
  return isOwner(requestingMember);
}

function canDeleteWorkspace(requestingMember) {
  return isOwner(requestingMember);
}

// OWNER + MEMBER
function canInviteMembers(member) {
  return isOwner(member) || isMember(member);
}

function canCreateChannel(member) {
  return isOwner(member) || isMember(member);
}

module.exports = {
  isOwner,
  isMember,
  canRemoveMember,
  canManageWorkspace,
  canDeleteWorkspace,
  canInviteMembers,
  canCreateChannel,
};
