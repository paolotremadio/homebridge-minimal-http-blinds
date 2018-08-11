const { Characteristic } = require('hap-nodejs');

const LastCheckTimestampUUID = '3c475ab4-9d90-11e8-98d0-529269fb1459';
function LastUpdateTimestamp() {
  const char = new Characteristic('Last update', LastCheckTimestampUUID);

  char.setProps({
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY],
  });
  char.value = char.getDefaultValue();

  return char;
}
LastUpdateTimestamp.UUID = LastCheckTimestampUUID;

const LastCheckStatusUUID = '3c475f0a-9d90-11e8-98d0-529269fb1459';
function LastUpdateStatus() {
  const char = new Characteristic('Update status', LastCheckStatusUUID);

  char.setProps({
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY],
  });
  char.value = char.getDefaultValue();

  return char;
}
LastUpdateStatus.UUID = LastCheckStatusUUID;

module.exports = {
  LastCheckTimestamp: LastUpdateTimestamp,
  LastCheckStatus: LastUpdateStatus,
};
