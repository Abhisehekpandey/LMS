import axios from "axios";

export const saveFileType = async ({
  documentType,
  username,
  attributes,
  token,
}) => {
    console.log(">>>usre",username)
    console.log(">>>token",token)
  const payload = attributes.map((attr) => ({
    attributeName: attr.name,
    attributeType: attr.type,
    value: attr.defaultValue,
    isMandatory: attr.mandatory,
    fileTypeDescription: attr.description,
  }));

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    fileType: documentType,
    username: username,
    isTypeAutoClassified: false,
  };

  const url = `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/newFileType`;

  const response = await axios.post(url, payload, { headers });
  return response.data;
};
