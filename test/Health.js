const Health = artifacts.require('./Health.sol')
const sha3 = require('solidity-sha3').default
const {soliditySHA3} = require('ethereumjs-abi')

const timestamp_1 = '92937849234'
const location_1 = 'Los Angeles'
const medType_1 = "ibuprophin"
const optional_1 = 'otherdata' 

const timestamp_2 = '44093753452'
const location_2 = 'Australia'
const medType_2 = "zyrtec"
const optional_2 = 'metadata' 

const timestamp_3 = '6620293842'
const location_3 = 'Japan'
const medType_3 = "benzodiazapine"
const optional_3 = 'extradata'  

const hash_1 = soliditySHA3(['uint','string', 'string', 'string'], [timestamp_1, medType_1, location_1, optional_1]);
const hash_2 = soliditySHA3(['uint','string', 'string', 'string'], [timestamp_2, medType_2, location_2, optional_2]);
const hash_3 = soliditySHA3(['uint','string', 'string', 'string'], [timestamp_3, medType_3, location_3, optional_3]);

const medicineRecordHash_1 = `0x${hash_1.toString('hex')}`
const medicineRecordHash_2 = `0x${hash_2.toString('hex')}`
const medicineRecordHash_3 = `0x${hash_3.toString('hex')}`
const company = 'TestInc'

function getLastEvent(instance) {
  return new Promise((resolve, reject) => {
    instance.allEvents()
    .watch((error, log) => {
      if (error) return reject(error)
      resolve(log)
    })
  })
}

contract('Health', function (accounts) {
  //const owner = accounts[0]
    const owner  = "0x03e277534906765629a2b278aff9a5cfb895045a";

	accounts = ["0x03e277534906765629a2b278aff9a5cfb895045a","0x25d277534906765629a2b278aff9a5cfb895045c"]
  it('should register company under companyAddress', async () => {
    const instance = await Health.deployed()
    const companyAddress = accounts[1]
    const isRegistered = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered, false)

    const isCompanyRegistered = await instance.isRegisteredCompany(company)
    assert.equal(isCompanyRegistered, false)

    await instance.registerCompanyAddress(company, companyAddress, {from: owner})
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const companyAddress2 = await instance.companyAddress.call(companyHash)
    console.log(companyAddress2, companyAddress)
    assert.equal(companyAddress2, companyAddress)

    const isRegistered2 = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered2, true)

    const isCompanyRegistered2 = await instance.isRegisteredCompany(company)
    assert.equal(isCompanyRegistered2, true)
  })

  it('should update companyAddress in contract', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]
    const updateToCompanyAddress = accounts[2]
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`

    // Update companyAddress
    await instance.updateCompanyAddress(company, updateToCompanyAddress, {from: owner})
    const companyAddress3 = await instance.companyAddress.call(companyHash)

    assert.equal(companyAddress3, updateToCompanyAddress)

    const isRegistered3 = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered3, false)

    const isRegistered4 = await instance.isRegisteredCompanyAddress(updateToCompanyAddress)
    assert.equal(isRegistered4, true)

    // Update companyAddress back
    await instance.updateCompanyAddress(company, companyAddress, {from: owner})
    const companyAddress4 = await instance.companyAddress.call(companyHash)

    assert.equal(companyAddress4, companyAddress)
  })


  it('should not be able to add medicine record if not registered as companyAddress', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[6]
    const timestamp = '923485834975'
    const location = 'alabama'
    const medType = "benzodiazapine"
    const optional = 'metadata'


    const hash = `0x${soliditySHA3([ 'uint', 'string', 'string', 'string'], [timestamp, medType, location, optional]).toString('hex')}`

    let _err = null

    try {
      await instance.addMedicineRecord(hash, {from: companyAddress})
    } catch (error) {
      _err = error
    }

    assert.ok(_err !== null)
  })

  it('should add medicine record hash to company medicines', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]
    const timestamp = '923485834975'
    const location = 'alabama'
    const medType = "benzodiazapine"
    const optional = 'metadata'

    const hash = `0x${soliditySHA3([ 'uint', 'string', 'string', 'string'], [timestamp, medType, location, optional]).toString('hex')}`

    await instance.addMedicineRecord(hash, {from: companyAddress})

    const eventObj = await getLastEvent(instance)
    assert.equal(eventObj.event, '_MedicineAdded')

    const medicineRecordHash = `0x${soliditySHA3([ 'uint', 'string', 'string', 'string'], [timestamp, medType, location, optional]).toString('hex')}`
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const medicineRecordHash2 = await instance.medicines.call(companyHash, medicineRecordHash)
    assert.equal(medicineRecordHash, medicineRecordHash2)
  })


  it('should add multiple medicine record hashes to companyAddress company', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]

    const medicineRecordList = [`0x${hash_1.toString('hex')}`, `0x${hash_2.toString('hex')}`, `0x${hash_3.toString('hex')}`]

    const result = await instance.addMedicineRecords(medicineRecordList, {from: companyAddress})

    const eventObj = await getLastEvent(instance)
    assert.equal(eventObj.event, '_MedicineAdded')

    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const medicineRecordHash_Result_1 = await instance.medicines.call(companyHash, medicineRecordHash_1)
    const medicineRecordHash_Result_2 = await instance.medicines.call(companyHash, medicineRecordHash_2)
    const medicineRecordHash_Result_3 = await instance.medicines.call(companyHash, medicineRecordHash_3)
    assert.equal(medicineRecordHash_Result_1, medicineRecordHash_1)
    assert.equal(medicineRecordHash_Result_2, medicineRecordHash_2)
    assert.equal(medicineRecordHash_Result_3, medicineRecordHash_3)

    // test max number of medicines possible in one tx
    const medicineRecordList_B = []
    for (var i = 0; i < 150; i++) {
      medicineRecordList_B.push(`0x${soliditySHA3(['string'], [`${i}`]).toString('hex')}`)
    }

    await instance.addMedicineRecords(medicineRecordList_B, {
      from: companyAddress
    })
    const medicineRecordHash_X = medicineRecordList_B[medicineRecordList_B.length-1]

    const medicineRecordHash_Result_X = await instance.medicines.call(companyHash, medicineRecordHash_X)
    assert.equal(medicineRecordHash_Result_X, medicineRecordHash_X)
  })


  it('should update companyAddress to registry and medicines transferred along with it', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]
    const updateToCompanyAddress = accounts[2]
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`

    // Update companyAddress
    await instance.updateCompanyAddress(company, updateToCompanyAddress, {from: owner})
    const companyAddress3 = await instance.companyAddress.call(companyHash)
    assert.equal(companyAddress3, updateToCompanyAddress)

    const isRegistered3 = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered3, false)

    const isRegistered4 = await instance.isRegisteredCompanyAddress(updateToCompanyAddress)
    assert.equal(isRegistered4, true)

    // Old companyAddress shoulnd't have medicines
    const isMedicine = await instance.doesRecordExistForCompany.call(companyAddress, timestamp_1, medType_1, location_1, optional_1)
    assert.equal(isMedicine, false)

    // New companyAddress should have medicines
    const isMedicine2 = await instance.doesRecordExistForCompany.call(updateToCompanyAddress, timestamp_1, medType_1, location_1, optional_1)
    assert.equal(isMedicine2, true)

    //  update companyAddress back to original account
    await instance.updateCompanyAddress(company, companyAddress, {from: owner})
    const companyAddress4 = await instance.companyAddress.call(companyHash)    
    assert.equal(companyAddress4, companyAddress)
  })

  it('should deregister companyAddress from contract', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]

    await instance.deregisterCompanyAddress(company, {from: owner})
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const [companyAddress2] = await instance.companyAddress.call(companyHash)

    assert.equal(companyAddress2, 0)

    const company2 = await instance.companies.call(companyAddress)
    assert.equal(parseInt(company2, 16), 0)

    const isRegistered = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered, false)

    const isCompanyRegistered = await instance.isRegisteredCompany(company)
    assert.equal(isCompanyRegistered, false)
  })

  it('should reregister companyAddress and it should not have medicines still exist', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]

    const isRegistered = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered, false)

    const isCompanyRegistered = await instance.isRegisteredCompany(company)
    assert.equal(isCompanyRegistered, false)

    await instance.registerCompanyAddress(company, companyAddress, {from: owner})
    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const companyAddress2 = await instance.companyAddress.call(companyHash)

    assert.equal(companyAddress2, companyAddress)

    const isRegistered2 = await instance.isRegisteredCompanyAddress(companyAddress)
    assert.equal(isRegistered2, true)

    const iscompanyRegistered2 = await instance.isRegisteredCompany(company)
    assert.equal(iscompanyRegistered2, true)

    const medicineRecordHash_Result_A = await instance.medicines.call(companyHash, medicineRecordHash_1)
    const medicineRecordHash_Result_B = await instance.medicines.call(companyHash, medicineRecordHash_2)
    const medicineRecordHash_Result_C = await instance.medicines.call(companyHash, medicineRecordHash_3)

    // TODO: Remove
    assert.equal(medicineRecordHash_Result_A, medicineRecordHash_1)
    assert.equal(medicineRecordHash_Result_B, medicineRecordHash_2)
    assert.equal(medicineRecordHash_Result_C, medicineRecordHash_3)

  })

  it('should remove medicine record from companyAddress company medicine records', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]
    const timestamp = '923485834975'
    const location = 'alabama'
    const medType = "benzodiazapine"
    const optional = 'metadata'
    const medicineRecordHash = `0x${soliditySHA3([ 'uint', 'string', 'string', 'string'], [timestamp, medType, location, optional]).toString('hex')}`

    await instance.removeMedicineRecord(medicineRecordHash, {from: companyAddress})
    
    const eventObj = await getLastEvent(instance)
    assert.equal(eventObj.event, '_MedicineRemoved')
    
    const isMedicineRecord = await instance.doesRecordExistForCompany.call(companyAddress, timestamp, medType, location, optional)
    assert.equal(isMedicineRecord, false)

    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const hash = await instance.medicines.call(companyHash, medicineRecordHash)

    assert.equal(parseInt(hash, 16), 0)


  })

  it('should remove multiple medicine record hashes from companyAddress medicine records', async () => {
    const instance = await Health.deployed()

    const companyAddress = accounts[1]

    const medicinesList = [`0x${hash_1.toString('hex')}`, `0x${hash_2.toString('hex')}`, `0x${hash_3.toString('hex')}`]

    var result = await instance.removeMedicineRecords(medicinesList, {
      from: companyAddress
    })

    const eventObj = await getLastEvent(instance)
    assert.equal(eventObj.event, '_MedicineRemoved')

    const companyHash = `0x${soliditySHA3(['bytes32'], [company]).toString('hex')}`
    const medicineRecordHash_Result_A = await instance.medicines.call(companyHash, medicineRecordHash_1)
    const medicineRecordHash_Result_B = await instance.medicines.call(companyHash, medicineRecordHash_2)
    const medicineRecordHash_Result_C = await instance.medicines.call(companyHash, medicineRecordHash_3)

    assert.equal(parseInt(medicineRecordHash_Result_A, 16), 0)
    assert.equal(parseInt(medicineRecordHash_Result_B, 16), 0)
    assert.equal(parseInt(medicineRecordHash_Result_C, 16), 0)
  })

  it('should be able to change owner if owner', async () => {
    const instance = await Health.deployed()

    const owner = await instance.owner.call()
    assert.equal(owner, accounts[0])

    const newOwner = accounts[1]
    await instance.changeOwner(newOwner)
    const owner2 = await instance.owner.call()
    assert.equal(owner2, newOwner)
  })

  it('should not be able to change owner if not owner', async () => {
    const instance = await Health.deployed()

    const owner = await instance.owner.call()
    assert.equal(owner, accounts[1])

    const newOwner = accounts[2]
    try {
      await instance.changeOwner(newOwner, {from: accounts[0]})
      const owner2 = await instance.owner.call()
      assert.notEqual(owner2, newOwner)
    } catch (error) {
      assert.notEqual(error, undefined)
    }
  })
})
