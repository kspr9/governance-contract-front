import smartpy as sp

@sp.module
def main():
    class TSWalletContract(sp.Contract):
        def __init__(self, adminWallet):
            self.data.admin_address = sp.cast(adminWallet, sp.address)
            # Stores tickets that represent shares
            self.data.share_balances = sp.cast({}, sp.map[sp.address, sp.ticket[sp.nat]])
            # Stores current active share ownership information
            self.data.active_share_ledger = sp.cast({}, sp.map[sp.address, sp.nat])
            self.data.registry_number = sp.cast(None, sp.option[sp.nat])
            self.data.max_shares = sp.cast(None, sp.option[sp.nat])
            self.data.issued_shares = sp.cast(0, sp.nat)
            self.data.allocated_shares = sp.cast(0, sp.nat)
            self.data.all_shares_issued = sp.cast(False, sp.bool)
            # Map of addresses eligible to claim initial share issuance
            self.data.owners_map = sp.cast({}, sp.map[sp.address, sp.nat])
            self.data.issued_unclaimed_shares2 = sp.cast({}, sp.map[sp.nat, sp.ticket[sp.nat]])

        @sp.entrypoint
        def change_admin(self, params):
            sp.cast(params, sp.address)
            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                data.admin_address = params
        
        @sp.entrypoint
        def add_company_data(self, params):
            sp.cast(params.registry_number, sp.nat)
            sp.cast(params.max_shares, sp.nat)
            sp.cast(params.issued_shares, sp.nat)
            sp.cast(params.all_shares_issued, sp.bool)
            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                data.registry_number = sp.Some(params.registry_number)
                data.max_shares = sp.Some(params.max_shares)
                
        @sp.entrypoint
        def change_max_shares(self, params):
            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                data.max_shares = sp.Some(params.new_max_shares)
                
        @sp.entrypoint
        def issue_shares_unclaimed2(self, params):
            sp.cast(params.shares_amount, sp.nat)
            
            with sp.modify_record(self.data) as data:
                assert data.registry_number.is_some(), "No registry number in storage"
                ticket_content = data.registry_number.unwrap_some()
                
                assert data.issued_shares + params.shares_amount <= data.max_shares.unwrap_some(), "Cannot issue this many shares"

                (option_ticket, x) = sp.get_and_update(0, None, data.issued_unclaimed_shares2)
                data.issued_unclaimed_shares2 = x
                data.issued_unclaimed_shares2[0] = sp.ticket(ticket_content, params.shares_amount)
                
                with sp.match(option_ticket):
                    with sp.case.Some as t:
                        t1 = sp.ticket(ticket_content, params.shares_amount)
                        (ticket_data, t2) = sp.read_ticket(t)
                        sp.cast(t2, sp.ticket[sp.nat])
                        data.issued_unclaimed_shares2[0] = sp.join_tickets(t2, t1)
                
                data.issued_shares += params.shares_amount

        @sp.entrypoint
        def add_share_owner(self, params):
            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                allocated_shares = sp.sum(data.owners_map.values())
                assert params.amount + allocated_shares <= data.issued_shares, "Not enough shares issued"
                data.owners_map[params.owner_address] = params.amount
                data.allocated_shares += params.amount
        
        @sp.entrypoint
        def remove_share_owner(self, params):
            sp.cast(params.owner_address, sp.address)
            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                amt_to_be_unallocated = data.owners_map[params.owner_address]
                del data.owners_map[params.owner_address]
                updated_share_allocation = sp.as_nat(data.allocated_shares - amt_to_be_unallocated)
                data.allocated_shares = updated_share_allocation

        @sp.entrypoint
        def process_share_claim(self):
            with sp.modify_record(self.data) as data:
                assert data.owners_map.contains(sp.sender), "Wallet not eligible claiming any shares"
                assert data.owners_map[sp.sender] > 0, "Your shares have not been issued yet"
                
                claimable_shares = data.owners_map[sp.sender]
                
                del data.owners_map[sp.sender]
                (option_ticket, x) = sp.get_and_update(0, None, data.issued_unclaimed_shares2)
                data.issued_unclaimed_shares2 = x
                
                with sp.match(option_ticket):
                    with sp.case.Some as t:  # If ticket exists
                        # Read the ticket to get its data and the actual ticket
                        (ticket_data, all_issued_tickets) = sp.read_ticket(t)
                        # Split the ticket into two parts:
                        # 1. The amount being claimed (t1)
                        # 2. The remaining amount (rest)
                        (rest, t1) = sp.split_ticket(
                            all_issued_tickets,  # original ticket
                            sp.as_nat(ticket_data.amount - claimable_shares),  # amount to keep
                            claimable_shares  # amount to send
                        )

                        # Store the remaining ticket back in storage
                        data.issued_unclaimed_shares2[0] = rest

                        # Step 5: Update the active ledger with new owner
                        data.active_share_ledger[sp.sender] = claimable_shares

                        # Step 6: Send the claimed shares to the claimer
                        # Create a contract interface to call receive_claimed_shares
                        destination_contract = sp.contract(
                            sp.record(
                                issuer=sp.address,  # The address of share issuer
                                ticket=sp.ticket[sp.nat]  # The ticket type
                            ), 
                            sp.sender,  # The address claiming shares
                            entrypoint="receive_shares"  # The entrypoint to call
                        )
                        
                        # Prepare the payload with the ticket
                        shares_payload = sp.record(
                            issuer=ticket_data.ticketer,  # The contract that created the ticket
                            ticket=t1  # The split ticket for claiming
                        )

                        # Send the shares to the claiming contract
                        sp.transfer(
                            shares_payload,
                            sp.mutez(0),  # No tez being sent
                            destination_contract.unwrap_some()
                        )
                        
        @sp.entrypoint
        def claim_shares(self, destination):
            sp.cast(destination, sp.address)
            sp.transfer((), sp.mutez(0), sp.contract(sp.unit, destination, entrypoint="process_share_claim").unwrap_some())

        @sp.entrypoint
        def receive_shares(self, payload):
            """Receives shares (tickets) from another contract.
            Stores the received tickets in share_balances."""
            record(issuer, ticket).match = payload
            with sp.modify_record(self.data) as data:
                data.share_balances[issuer] = ticket

        @sp.entrypoint
        def claim_shares_direct(self, params):
            """Allows direct claiming of shares without needing a separate wallet contract.
            
            Args:
                params.destination_address: Address that will receive the shares
            """
            sp.cast(params.destination_address, sp.address)
            
            with sp.modify_record(self.data) as data:
                assert data.owners_map.contains(params.destination_address), "Destination not eligible for claiming shares"
                assert data.owners_map[params.destination_address] > 0, "No shares allocated to destination"

                claimable_shares = data.owners_map[params.destination_address]
                # Remove from owners_map as shares are being claimed
                del data.owners_map[params.destination_address]
                
                # Update active_share_ledger with new owner
                data.active_share_ledger[params.destination_address] = claimable_shares
                
                (option_ticket, x) = sp.get_and_update(0, None, data.issued_unclaimed_shares2)
                data.issued_unclaimed_shares2 = x

                with sp.match(option_ticket):
                    with sp.case.Some as t:
                        (ticket_data, all_issued_tickets) = sp.read_ticket(t)
                        (rest, t1) = sp.split_ticket(
                            all_issued_tickets, 
                            sp.as_nat(ticket_data.amount - claimable_shares), 
                            claimable_shares
                        )
                        data.issued_unclaimed_shares2[0] = rest
                        
                        destination_contract = sp.contract(
                            sp.record(issuer=sp.address, ticket=sp.ticket[sp.nat]), 
                            params.destination_address, 
                            entrypoint="receive_shares"
                        )
                        
                        shares_payload = sp.record(
                            issuer=ticket_data.ticketer, 
                            ticket=t1
                        )
                        sp.transfer(shares_payload, sp.mutez(0), destination_contract.unwrap_some())

        @sp.entrypoint
        def update_share_ledger(self, params):
            """Updates the active share ledger when shares are transferred between contracts.
            Can only be called by contracts that own shares."""
            sp.cast(params.from_address, sp.address)
            sp.cast(params.to_address, sp.address)
            sp.cast(params.amount, sp.nat)
            
            with sp.modify_record(self.data) as data:
                # Verify the sender is actually transferring their own shares
                assert sp.sender == params.from_address, "Only share owner can update ledger"
                assert data.active_share_ledger.contains(params.from_address), "Source address not in ledger"
                assert data.active_share_ledger[params.from_address] >= params.amount, "Insufficient shares in ledger"

                # Update source address balance
                current_balance = data.active_share_ledger[params.from_address]
                if current_balance == params.amount:
                    del data.active_share_ledger[params.from_address]
                else:
                    data.active_share_ledger[params.from_address] = sp.as_nat(current_balance - params.amount)

                # Update destination address balance
                if data.active_share_ledger.contains(params.to_address):
                    data.active_share_ledger[params.to_address] += params.amount
                else:
                    data.active_share_ledger[params.to_address] = params.amount
                    
        @sp.entrypoint
        def transfer_shares(self, params):
            """Transfers shares (tickets) to another contract and updates the issuing contract's ledger."""
            sp.cast(params.share, sp.address)  # issuing contract address
            sp.cast(params.amount, sp.nat)
            sp.cast(params.destination, sp.address)

            with sp.modify_record(self.data) as data:
                assert sp.sender == data.admin_address, "Caller not Admin"
                (option_ticket, modified_share_balances) = sp.get_and_update(params.share, None, data.share_balances)
                data.share_balances = modified_share_balances

                with sp.match(option_ticket):
                    with sp.case.Some as t:
                        (ticket_data, all_issued_shares) = sp.read_ticket(t)
                        transferrable_ticket = sp.ticket(1,1)
                        sp.cast(transferrable_ticket, sp.ticket[sp.nat])
                        if params.amount < ticket_data.amount:
                            (rest, t1) = sp.split_ticket(
                                all_issued_shares, 
                                sp.as_nat(ticket_data.amount - params.amount), 
                                params.amount
                            )
                            data.share_balances[ticket_data.ticketer] = rest
                            transferrable_ticket = t1
                        else:
                            transferrable_ticket = all_issued_shares

                        # First update the ledger in the issuing contract
                        issuing_contract = sp.contract(
                            sp.record(
                                from_address=sp.address,
                                to_address=sp.address,
                                amount=sp.nat
                            ),
                            params.share,
                            entrypoint="update_share_ledger"
                        )
                        
                        ledger_update = sp.record(
                            from_address=sp.self_address(),
                            to_address=params.destination,
                            amount=params.amount
                        )
                        sp.transfer(ledger_update, sp.mutez(0), issuing_contract.unwrap_some())

                        # Then transfer the tickets
                        destination_contract = sp.contract(
                            sp.record(issuer=sp.address, ticket=sp.ticket[sp.nat]), 
                            params.destination, 
                            entrypoint="receive_claimed_shares"
                        )
                        shares_payload = sp.record(
                            issuer=ticket_data.ticketer,
                            ticket=transferrable_ticket
                        )
                        sp.transfer(shares_payload, sp.mutez(0), destination_contract.unwrap_some())

    class Governance(sp.Contract):
        def __init__(self, governanceAdmin):
            self.data.admin = sp.cast(governanceAdmin, sp.address)
            self.data.deployedContracts = sp.cast({}, sp.map[sp.nat, sp.address])

        @sp.entrypoint
        def create_company(self, companyID, shares, admin):
            assert sp.sender == self.data.admin, "NotAdmin"
            new_company = sp.create_contract(
                TSWalletContract, 
                None, 
                sp.tez(0), 
                sp.record(
                    admin_address=admin,
                    share_balances={},
                    registry_number=sp.Some(companyID),
                    max_shares=sp.Some(shares),
                    issued_shares=0,
                    allocated_shares=0,
                    all_shares_issued=False,
                    owners_map={},
                    active_share_ledger={},
                    issued_unclaimed_shares2={}
                )
            )
            self.data.deployedContracts[companyID] = new_company

if "main" in __name__:
    @sp.add_test()
    def test():
        scenario = sp.test_scenario("TSWalletContract", main)
        
        admin1 = sp.test_account("Admin1")
        admin2 = sp.test_account("Admin2")
        
        scenario.h1("Initial TSWallet test")
        scenario.h3("Deploy 1st contract - admin1 as admin")
        c1 = main.TSWalletContract(admin1.address)
        scenario += c1
        

        scenario.h2("Admin Address").show(c1.data.admin_address)

        # Changing the admin address test
        scenario.h2("Changing admin address to admin2")
        c1.change_admin(admin2.address, _sender=admin1.address)
        scenario.p("Changed Admin Address").show(c1.data.admin_address)

        # Add Company data to storage
        registry_number = 123456
        max_shares = 2500
        issued_shares = 0
        all_shares_issued = False
        scenario.h2("Adding company data to Storage")
        c1.add_company_data(registry_number=registry_number, max_shares=max_shares, issued_shares=issued_shares, all_shares_issued=all_shares_issued, _sender=admin2.address)
        
        # Test issuing shares
        #scenario.p("REG NO").show(c1.data.company_data.registry_number.unwrap_some("No company data"))
        shares_amt1 = 1000
        shares_amt2 = 500
        shares_amt3 = 700
        scenario.h2("Test Issuing Shares")
        scenario.h3("Issuing first batch of shares -- 1000 shares")
        c1.issue_shares_unclaimed2(shares_amount=shares_amt1)
        scenario.h3("Issuing second batch of shares -- 500 shares")
        c1.issue_shares_unclaimed2(shares_amount=shares_amt2)
        scenario.h3("Issuing second batch of shares -- 700 shares")
        c1.issue_shares_unclaimed2(shares_amount=shares_amt3)
        scenario.h3("Trying to issue shares amount that exceed max_shares -- 700 shares")
        c1.issue_shares_unclaimed2(shares_amount=shares_amt3, _valid=False)


        # Test adding and removeing a share owner
        user1 = sp.test_account("User1")
        user2 = sp.test_account("User2")
        user3 = sp.test_account("User3")
        user4 = sp.test_account("User4")
        
        scenario.h2("Test adding, removing owners")
        scenario.h3("Add share owner to the owners_map 500")
        c1.add_share_owner(owner_address=user1.address, amount=500, _sender=admin2.address)
        scenario.h3("Add share owner to the owners_map 1000")
        c1.add_share_owner(owner_address=user2.address, amount=1000, _sender=admin2.address)
        scenario.h3("Add share owner to the owners_map 700")
        c1.add_share_owner(owner_address=user3.address, amount=700, _sender=admin2.address)
        scenario.h3("Add share owner to the owners_map 300 - but fail since not enough issued shares")
        c1.add_share_owner(owner_address=user4.address, amount=300, _sender=admin2.address, _valid=False)
        scenario.h3("Remove share owner from the owners_map 500")
        c1.remove_share_owner(owner_address=user1.address, _sender=admin2.address)

        ###   C2
        # creating another contract to test the interactions.
        scenario.h2("Deploying 2nd contract to test claiming of shares")
        c2 = main.TSWalletContract(admin1.address)
        scenario += c2
        scenario.p("Address of second originated contract").show(c2.address)
        scenario.p("Address of first originated contract").show(c1.address)
        scenario.h3("Adding C2 as share owner to C1")
        c1.add_share_owner(owner_address=c2.address, amount=300, _sender=admin2.address)

        scenario.h3("Claiming C2 owned shares from C1, C2 admin calls C2 EP by passing C1 address as value")
        c2.claim_shares(c1.address, _sender=admin1.address)

        ### GovernanceContract
        ######################
        #gov_admin = sp.test_account("GovernanceAdmin")
        gov_admin_address = sp.address("tz1QSURdw5fx5E24q2LGcPmiekyP38L3GpXf")
        
        scenario.h1("Initial Governance test")
        
        gov_contract = main.Governance(governanceAdmin=gov_admin_address)
        scenario += gov_contract
        scenario.h2("Admin Address").show(gov_contract.data.admin)
        
        registry_number = 654321
        max_shares = 1111
        issued_shares = 0
        all_shares_issued = False
        scenario.h2("Calling create_company EP in Governance Contract")
        gov_contract.create_company(companyID=registry_number, shares=max_shares, admin=admin1.address, _sender=gov_admin_address)

        #gov_c3 = scenario.dynamic_contract(main.TSWalletContract)
        gov_c3 = scenario.dynamic_contract(main.TSWalletContract)
        #scenario.p("Address of Governance originated contract - C3").show(gov_c3.address)

        scenario.h3("Add gov_c3 as share owner to the C1 owners_map 200")
        c1.add_share_owner(owner_address=gov_c3.address, amount=200, _sender=admin2.address)

        gov_c3.claim_shares(c1.address, _sender=gov_admin_address)
        #gov_c3.transfer_shares(share=c1.address, amount=200, destination=c2.address, _sender=admin1.address)
        #gov_c3.transfer_shares(share=c1.address, amount=200, destination=c2.address, _sender=admin1.address)
        
