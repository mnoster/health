pragma solidity ^0.4.4;


contract Health {
  /**
   * @notice a mapping of companies to companyAddress public keys
   *
   * @example
   * "Medi Corp" -> "0x9L1m03nl0Pc5ns4kh2KL2m"
   * companyAddress[companyHash] = Public Key
   */
  mapping (bytes32 => address) public companyAddress;

  /**
   * @notice a mapping of companyAddress public keys and companyHash to companies
   *
   * @example
   * "0x123...abc" -> "Medi Corp"
   */
  mapping (address => bytes32) public companies;

   /**
    * @notice a mapping of publsher companies to
    * their hashes of authorized Medicines
    *
    * @example example
    * Medicines[keccak256(company)][MedicineHash] -> MedicineHash
    */
  mapping (bytes32 => mapping (bytes32 => bytes32)) public medicines;

  /**
   * @notice The owner of this contract.
   */
  address public owner;

  /**
   * Events, when triggered, record logs in the blockchain.
   * Clients can listen on specific events to fetch data.
   */
  event _CompanyAddressRegistered(bytes32 indexed company, address indexed companyAddressKey);
  event _CompanyAddressUpdated(bytes32 indexed company, address indexed companyAddressKey);
  event _CompanyAddressDeregistered(bytes32 indexed company, address indexed companyAddressKey);
  event _MedicineAdded(bytes32 indexed company, bytes32 indexed medicineHash);
  event _MedicineRemoved(bytes32 indexed company, bytes32 indexed medicineHash);

  /**
   * @notice modifier which limits execution
   * of the function to the owner.
   */
  modifier onlyOwner() {
    if (msg.sender != owner) {
      revert();
    }

    // continue with code execution
    _;
  }

  /**
   * @notice modifier which checks if sender is
   * a registered companyAddress.
   */
  modifier isRegistered() {
    if (companies[msg.sender] == 0) {
      revert();
    }

    // continue with code execution
    _;
  }

  /**
   * @notice modifier which checks that
   * companyAddress doesn't exist.
   */
  modifier companyAddressDoesNotExist(address pubKey) {
    if (companies[pubKey] != 0) {
      revert();
    }

    _;
  }

  /*
   * @notice The constructor function,
   * called only once when this contract is initially deployed.
   */
  function Health() public {
    owner = msg.sender;
  }

  /**
   * @notice Change owner of contract.
   * @param newOwner new owner address
   */
  function changeOwner(address newOwner) onlyOwner external {
    owner = newOwner;
  }

  /**
   * @notice Register new companyAddress.
   * Only the owner of the contract can register new companyAddress.
   * companyAddress public key must not already exist in order to
   * be added or modified.
   * @param company pubisher companies
   * @param pubKey pubisher public key
   */
  function registerCompanyAddress(bytes32 company, address pubKey) onlyOwner companyAddressDoesNotExist(pubKey) external {
    companyAddress[keccak256(company)] = pubKey;
    companies[pubKey] = company;
    _CompanyAddressRegistered(company, pubKey);
  }

  /**
   * @notice Update new companyAddress.
   * Only the owner of the contract can update companyAddress.
   * companyAddress public key must already exist in order to
   * be modified.
   * @param company pubisher companies
   * @param pubKey pubisher public key
   */
  function updateCompanyAddress(bytes32 company, address pubKey) onlyOwner external {
    bytes32 companyHash = keccak256(company);
    require(companyAddress[companyHash] != address(0));

    // remove old companyAddress key
    address oldPubKey = companyAddress[companyHash];
    delete companies[oldPubKey];

    // Update companyAddress pubKey 
    companyAddress[companyHash] = pubKey;
    companies[pubKey] = company;

   _CompanyAddressUpdated(company, pubKey);
  }

  /**
   * @notice Deregister existing companyAddress.
   * Only contract owner is allowed to deregister.
   * @param company  public key
   */
  function deregisterCompanyAddress(bytes32 company) onlyOwner external {
    bytes32 companyHash = keccak256(company);
    address pubKey = companyAddress[companyHash];
    require(companyAddress[companyHash] != address(0));
    // order matters here, delete pub from map first.
    delete companyAddress[companyHash];
    delete companies[pubKey];

   _CompanyAddressDeregistered(companies[pubKey], pubKey);
  }

  /**
   * @notice Allow companyAddress to add a Medicine by the hash of the Medicine information.
   * @param hash keccak256 hash of Medicine information
   */
  function addMedicineRecord(bytes32 hash) isRegistered public {
    medicines[keccak256(companies[msg.sender])][hash] = hash;
   _MedicineAdded(companies[msg.sender], hash);
  }

  /**
   * @notice Allow companyAddress to add multiple Medicines by providing an array of hashes of the Medicine information.
   * @param hashes an array of hashes of Medicine information
   */
  function addMedicineRecords(bytes32[] hashes) isRegistered public {
    for (uint256 i = 0; i < hashes.length; i++) {
      addMedicineRecord(hashes[i]);
    }
  }

  /**
   * @notice Remove Medicine from companyAddress
   * @param hash keccak256 hash of Medicine information
   */
  function removeMedicineRecord(bytes32 hash) isRegistered public {
    delete medicines[keccak256(companies[msg.sender])][hash];
   _MedicineRemoved(companies[msg.sender], hash);
  }

  /**
   * @notice Allow companyAddress to remove multiple Medicines by providing an array of hashes of the Medicine information.
   * @param hashes an array of hashes of the Medicine information
   */
  function removeMedicineRecords(bytes32[] hashes) isRegistered public {
    for (uint256 i = 0; i < hashes.length; i++) {
      removeMedicineRecord(hashes[i]);
    }
  }

  /**
    * @notice Get companyAddress public key from companies name
    * @param company companies of companyAddress
    * @return companyAddress public key
    */
  function getCompanyAddressFromCompany(string company) public constant returns (address) {
    return companyAddress[keccak256(company)];
  }

  /**
   * @notice Check if companyAddress is registered.
   * @param pubKey companyAddress public key
   * @return bool
   */
  function isRegisteredCompanyAddress(address pubKey) external constant returns (bool) {
    return (companies[pubKey] != "");
  }

  /**
   * @notice Check if companyAddress is registered by companies
   * @param company pubisher companies
   * @return bool
   */
  function isRegisteredCompany(bytes32 company) external constant returns (bool) {
    return (companyAddress[keccak256(company)] != address(0));
  }

  /**
   * @notice Return true if is Medicine for companyAddress
   * @param pubKey companyAddress public key
   * @param timestamp companies of Medicine
   * @param medType associated with Medicine or reMedicine in advertising system 
   * @param location Relationship of Medicine. (Direct: 0, ReMedicine: 1)
   * @param optional Optional Params (tagId, format, region)
   * @return boolean
   */
  function doesRecordExistForCompany(
    address pubKey,
    uint timestamp,
    string medType,
    string location,
    string optional
  )
  external
  constant
  returns (bool) 
  {
    bytes32 hash = keccak256(timestamp, medType, location, optional);
    return (medicines[keccak256(companies[pubKey])][hash] != "");
  }
}

