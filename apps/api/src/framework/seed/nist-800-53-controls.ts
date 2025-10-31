import { ControlDefinition } from '../framework.types';

export const nist80053Rev5Controls: ControlDefinition[] = [
  {
    "id": "ac-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] access control policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the access control policy and the associated access controls; Designate an [official] to manage the development, documentation, and dissemination of the access control policy and procedures; and Review and update the current access control: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f",
      "7f473f21-fdbf-4a6c-81a1-0ab95919609d"
    ],
    "relatedControls": [
      "ia-1",
      "pm-9",
      "pm-24",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ac-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Concurrent Session Control",
    "description": "Limit the number of concurrent sessions for each [account and/or account types] to [number].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "sc-23"
    ]
  },
  {
    "id": "ac-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Device Lock",
    "description": "Prevent further access to the system by [choose: initiating a device lock after {{ insert: param, ac-11_odp.02 }} of inactivity, requiring the user to initiate a device lock before leaving the system unattended] ; and Retain the device lock until the user reestablishes access using established identification and authentication procedures.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ac-7",
      "ia-11",
      "pl-4"
    ]
  },
  {
    "id": "ac-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-11",
    "family": "Access Control",
    "title": "Pattern-hiding Displays",
    "description": "Conceal, via the device lock, information previously visible on the display with a publicly viewable image.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Session Termination",
    "description": "Automatically terminate a user session after [conditions or trigger events].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ma-4",
      "sc-10",
      "sc-23"
    ]
  },
  {
    "id": "ac-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-12",
    "family": "Access Control",
    "title": "User-initiated Logouts",
    "description": "Provide a logout capability for user-initiated communications sessions whenever authentication is used to gain access to [information resources].",
    "priority": "P3"
  },
  {
    "id": "ac-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-12",
    "family": "Access Control",
    "title": "Termination Message",
    "description": "Display an explicit logout message to users indicating the termination of authenticated communications sessions.",
    "priority": "P3"
  },
  {
    "id": "ac-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-12",
    "family": "Access Control",
    "title": "Timeout Warning Message",
    "description": "Display an explicit message to users indicating that the session will end in [time].",
    "priority": "P3"
  },
  {
    "id": "ac-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Supervision and Review — Access Control",
    "description": "Supervision and Review — Access Control",
    "priority": "P3"
  },
  {
    "id": "ac-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Permitted Actions Without Identification or Authentication",
    "description": "Identify [user actions] that can be performed on the system without identification or authentication consistent with organizational mission and business functions; and Document and provide supporting rationale in the security plan for the system, user actions not requiring identification or authentication.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-8",
      "ia-2",
      "pl-2"
    ]
  },
  {
    "id": "ac-14.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-14",
    "family": "Access Control",
    "title": "Necessary Uses",
    "description": "Necessary Uses",
    "priority": "P3"
  },
  {
    "id": "ac-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Automated Marking",
    "description": "Automated Marking",
    "priority": "P3"
  },
  {
    "id": "ac-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Security and Privacy Attributes",
    "description": "Provide the means to associate [organization-defined types of security and privacy attributes] with [organization-defined security and privacy attribute values] for information in storage, in process, and/or in transmission; Ensure that the attribute associations are made and retained with the information; Establish the following permitted security and privacy attributes from the attributes defined in [AC-16a](#ac-16_smt.a) for [organization-defined systems]: [organization-defined security and privacy attributes]; Determine the following permitted attribute values or ranges for each of the established attributes: [attribute values or ranges]; Audit changes to attributes; and Review [organization-defined security and privacy attributes] for applicability [organization-defined frequency].",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "2956e175-f674-43f4-b1b9-e074ad9fc39c",
      "388a3aa2-5d85-4bad-b8a3-77db80d63c4f"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-6",
      "ac-21",
      "ac-25",
      "au-2",
      "au-10",
      "mp-3",
      "pe-22",
      "pt-2",
      "pt-3",
      "pt-4",
      "sc-11",
      "sc-16",
      "si-12",
      "si-18"
    ]
  },
  {
    "id": "ac-16.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Dynamic Attribute Association",
    "description": "Dynamically associate security and privacy attributes with [organization-defined subjects and objects] in accordance with the following security and privacy policies as information is created and combined: [organization-defined security and privacy policies].",
    "priority": "P3"
  },
  {
    "id": "ac-16.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Attribute Configuration by Authorized Individuals",
    "description": "Provide authorized individuals the capability to define or change the type and value of security and privacy attributes available for association with subjects and objects.",
    "priority": "P3"
  },
  {
    "id": "ac-16.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Attribute Value Changes by Authorized Individuals",
    "description": "Provide authorized individuals (or processes acting on behalf of individuals) the capability to define or change the value of associated security and privacy attributes.",
    "priority": "P3"
  },
  {
    "id": "ac-16.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Maintenance of Attribute Associations by System",
    "description": "Maintain the association and integrity of [organization-defined security and privacy attributes] to [organization-defined subjects and objects].",
    "priority": "P3"
  },
  {
    "id": "ac-16.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Association of Attributes by Authorized Individuals",
    "description": "Provide the capability to associate [organization-defined security and privacy attributes] with [organization-defined subjects and objects] by authorized individuals (or processes acting on behalf of individuals).",
    "priority": "P3"
  },
  {
    "id": "ac-16.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Attribute Displays on Objects to Be Output",
    "description": "Display security and privacy attributes in human-readable form on each object that the system transmits to output devices to identify [instructions] using [naming conventions].",
    "priority": "P3"
  },
  {
    "id": "ac-16.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Maintenance of Attribute Association",
    "description": "Require personnel to associate and maintain the association of [organization-defined security and privacy attributes] with [organization-defined subjects and objects] in accordance with [organization-defined security and privacy policies].",
    "priority": "P3"
  },
  {
    "id": "ac-16.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Consistent Attribute Interpretation",
    "description": "Provide a consistent interpretation of security and privacy attributes transmitted between distributed system components.",
    "priority": "P3"
  },
  {
    "id": "ac-16.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Association Techniques and Technologies",
    "description": "Implement [organization-defined techniques and technologies] in associating security and privacy attributes to information.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ac-16.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-16",
    "family": "Access Control",
    "title": "Attribute Reassignment — Regrading Mechanisms",
    "description": "Change security and privacy attributes associated with information only via regrading mechanisms validated using [organization-defined techniques or procedures].",
    "priority": "P3"
  },
  {
    "id": "ac-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Remote Access",
    "description": "Establish and document usage restrictions, configuration/connection requirements, and implementation guidance for each type of remote access allowed; and Authorize each type of remote access to the system prior to allowing such connections.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "83b9d63b-66b1-467c-9f3b-3a0b108771e9",
      "d4d7c760-2907-403b-8b2a-767ca5370ecd",
      "6bc4d137-aece-42a8-8081-9ecb1ebe9fb4",
      "42e37e51-7cc0-4ffa-81c9-0ac942da7e99",
      "d17ebd7a-ffab-499d-bfff-e705bbb01fa6",
      "3915a084-b87b-4f02-83d4-c369e746292f"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-4",
      "ac-18",
      "ac-19",
      "ac-20",
      "ca-3",
      "cm-10",
      "ia-2",
      "ia-3",
      "ia-8",
      "ma-4",
      "pe-17",
      "pl-2",
      "pl-4",
      "sc-10",
      "sc-12",
      "sc-13",
      "si-4"
    ]
  },
  {
    "id": "ac-17.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Monitoring and Control",
    "description": "Employ automated mechanisms to monitor and control remote access methods.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-6",
      "au-12",
      "au-14"
    ]
  },
  {
    "id": "ac-17.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Authenticate Remote Commands",
    "description": "Implement [mechanisms] to authenticate [remote commands].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13",
      "sc-23"
    ]
  },
  {
    "id": "ac-17.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Protection of Confidentiality and Integrity Using Encryption",
    "description": "Implement cryptographic mechanisms to protect the confidentiality and integrity of remote access sessions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ac-17.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Managed Access Control Points",
    "description": "Route remote accesses through authorized and managed network access control points.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-7"
    ]
  },
  {
    "id": "ac-17.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Privileged Commands and Access",
    "description": "Authorize the execution of privileged commands and access to security-relevant information via remote access only in a format that provides assessable evidence and for the following needs: [organization-defined needs] ; and Document the rationale for remote access in the security plan for the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-6",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ac-17.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Monitoring for Unauthorized Connections",
    "description": "Monitoring for Unauthorized Connections",
    "priority": "P3"
  },
  {
    "id": "ac-17.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Protection of Mechanism Information",
    "description": "Protect information about remote access mechanisms from unauthorized use and disclosure.",
    "priority": "P3",
    "relatedControls": [
      "at-2",
      "at-3",
      "ps-6"
    ]
  },
  {
    "id": "ac-17.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Additional Protection for Security Function Access",
    "description": "Additional Protection for Security Function Access",
    "priority": "P3"
  },
  {
    "id": "ac-17.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Disable Nonsecure Network Protocols",
    "description": "Disable Nonsecure Network Protocols",
    "priority": "P3"
  },
  {
    "id": "ac-17.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-17",
    "family": "Access Control",
    "title": "Disconnect or Disable Access",
    "description": "Provide the capability to disconnect or disable remote access to the system within [time period].",
    "priority": "P3"
  },
  {
    "id": "ac-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Wireless Access",
    "description": "Establish configuration requirements, connection requirements, and implementation guidance for each type of wireless access; and Authorize each type of wireless access to the system prior to allowing such connections.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "25e3e57b-dc2f-4934-af9b-050b020c6f0e",
      "03fb73bc-1b12-4182-bd96-e5719254ea61"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-17",
      "ac-19",
      "ca-9",
      "cm-7",
      "ia-2",
      "ia-3",
      "ia-8",
      "pl-4",
      "sc-40",
      "sc-43",
      "si-4"
    ]
  },
  {
    "id": "ac-18.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-18",
    "family": "Access Control",
    "title": "Authentication and Encryption",
    "description": "Protect wireless access to the system using authentication of [choose: users, devices] and encryption.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ac-18.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-18",
    "family": "Access Control",
    "title": "Monitoring Unauthorized Connections",
    "description": "Monitoring Unauthorized Connections",
    "priority": "P3"
  },
  {
    "id": "ac-18.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-18",
    "family": "Access Control",
    "title": "Disable Wireless Networking",
    "description": "Disable, when not intended for use, wireless networking capabilities embedded within system components prior to issuance and deployment.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-18.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-18",
    "family": "Access Control",
    "title": "Restrict Configurations by Users",
    "description": "Identify and explicitly authorize users allowed to independently configure wireless networking capabilities.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "sc-7",
      "sc-15"
    ]
  },
  {
    "id": "ac-18.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-18",
    "family": "Access Control",
    "title": "Antennas and Transmission Power Levels",
    "description": "Select radio antennas and calibrate transmission power levels to reduce the probability that signals from wireless access points can be received outside of organization-controlled boundaries.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "pe-19"
    ]
  },
  {
    "id": "ac-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Access Control for Mobile Devices",
    "description": "Establish configuration requirements, connection requirements, and implementation guidance for organization-controlled mobile devices, to include when such devices are outside of controlled areas; and Authorize the connection of mobile devices to organizational systems.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "42e37e51-7cc0-4ffa-81c9-0ac942da7e99",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-7",
      "ac-11",
      "ac-17",
      "ac-18",
      "ac-20",
      "ca-9",
      "cm-2",
      "cm-6",
      "ia-2",
      "ia-3",
      "mp-2",
      "mp-4",
      "mp-5",
      "mp-7",
      "pl-4",
      "sc-7",
      "sc-34",
      "sc-43",
      "si-3",
      "si-4"
    ]
  },
  {
    "id": "ac-19.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-19",
    "family": "Access Control",
    "title": "Use of Writable and Portable Storage Devices",
    "description": "Use of Writable and Portable Storage Devices",
    "priority": "P3"
  },
  {
    "id": "ac-19.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-19",
    "family": "Access Control",
    "title": "Use of Personally Owned Portable Storage Devices",
    "description": "Use of Personally Owned Portable Storage Devices",
    "priority": "P3"
  },
  {
    "id": "ac-19.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-19",
    "family": "Access Control",
    "title": "Use of Portable Storage Devices with No Identifiable Owner",
    "description": "Use of Portable Storage Devices with No Identifiable Owner",
    "priority": "P3"
  },
  {
    "id": "ac-19.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-19",
    "family": "Access Control",
    "title": "Restrictions for Classified Information",
    "description": "Prohibit the use of unclassified mobile devices in facilities containing systems processing, storing, or transmitting classified information unless specifically permitted by the authorizing official; and Enforce the following restrictions on individuals permitted by the authorizing official to use unclassified mobile devices in facilities containing systems processing, storing, or transmitting classified information: Connection of unclassified mobile devices to classified systems is prohibited; Connection of unclassified mobile devices to unclassified systems requires approval from the authorizing official; Use of internal or external modems or wireless interfaces within the unclassified mobile devices is prohibited; and Unclassified mobile devices and the information stored on those devices are subject to random reviews and inspections by [security officials] , and if classified information is found, the incident handling policy is followed. Restrict the connection of classified mobile devices to classified systems in accordance with [security policies].",
    "priority": "P3",
    "relatedControls": [
      "cm-8",
      "ir-4"
    ]
  },
  {
    "id": "ac-19.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-19",
    "family": "Access Control",
    "title": "Full Device or Container-based Encryption",
    "description": "Employ [choose: full-device encryption, container-based encryption] to protect the confidentiality and integrity of information on [mobile devices].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-12",
      "sc-13",
      "sc-28"
    ]
  },
  {
    "id": "ac-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Account Management",
    "description": "Define and document the types of accounts allowed and specifically prohibited for use within the system; Assign account managers; Require [prerequisites and criteria] for group and role membership; Specify: Authorized users of the system; Group and role membership; and Access authorizations (i.e., privileges) and [attributes (as required)] for each account; Require approvals by [personnel or roles] for requests to create accounts; Create, enable, modify, disable, and remove accounts in accordance with [policy, procedures, prerequisites, and criteria]; Monitor the use of accounts; Notify account managers and [personnel or roles] within: [time period] when accounts are no longer required; [time period] when users are terminated or transferred; and [time period] when system usage or need-to-know changes for an individual; Authorize access to the system based on: A valid access authorization; Intended system usage; and [attributes (as required)]; Review accounts for compliance with account management requirements [frequency]; Establish and implement a process for changing shared or group account authenticators (if deployed) when individuals are removed from the group; and Align account management processes with personnel termination and transfer processes.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "2956e175-f674-43f4-b1b9-e074ad9fc39c",
      "388a3aa2-5d85-4bad-b8a3-77db80d63c4f",
      "53df282b-8b3f-483a-bad1-6a8b8ac00114"
    ],
    "relatedControls": [
      "ac-3",
      "ac-5",
      "ac-6",
      "ac-17",
      "ac-18",
      "ac-20",
      "ac-24",
      "au-2",
      "au-12",
      "cm-5",
      "ia-2",
      "ia-4",
      "ia-5",
      "ia-8",
      "ma-3",
      "ma-5",
      "pe-2",
      "pl-4",
      "ps-2",
      "ps-4",
      "ps-5",
      "ps-7",
      "pt-2",
      "pt-3",
      "sc-7",
      "sc-12",
      "sc-13",
      "sc-37"
    ]
  },
  {
    "id": "ac-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Automated System Account Management",
    "description": "Support the management of system accounts using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-2.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Shared and Group Account Credential Change",
    "description": "Shared and Group Account Credential Change",
    "priority": "P3"
  },
  {
    "id": "ac-2.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Usage Conditions",
    "description": "Enforce [circumstances and/or usage conditions] for [system accounts].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ac-2.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Account Monitoring for Atypical Usage",
    "description": "Monitor system accounts for [atypical usage] ; and Report atypical usage of system accounts to [personnel or roles].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-6",
      "au-7",
      "ca-7",
      "ir-8",
      "si-4"
    ]
  },
  {
    "id": "ac-2.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Disable Accounts for High-risk Individuals",
    "description": "Disable accounts of individuals within [time period] of discovery of [significant risks].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-6",
      "si-4"
    ]
  },
  {
    "id": "ac-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Automated Temporary and Emergency Account Management",
    "description": "Automatically [choose: remove, disable] temporary and emergency accounts after [time period].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Disable Accounts",
    "description": "Disable accounts within [time period] when the accounts: Have expired; Are no longer associated with a user or individual; Are in violation of organizational policy; or Have been inactive for [time period].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Automated Audit Actions",
    "description": "Automatically audit account creation, modification, enabling, disabling, and removal actions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-6"
    ]
  },
  {
    "id": "ac-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Inactivity Logout",
    "description": "Require that users log out when [time period of expected inactivity or description of when to log out].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-11"
    ]
  },
  {
    "id": "ac-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Dynamic Privilege Management",
    "description": "Implement [dynamic privilege management capabilities].",
    "priority": "P3",
    "relatedControls": [
      "ac-16"
    ]
  },
  {
    "id": "ac-2.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Privileged User Accounts",
    "description": "Establish and administer privileged user accounts in accordance with [choose: a role-based access scheme, an attribute-based access scheme]; Monitor privileged role or attribute assignments; Monitor changes to roles or attributes; and Revoke access when privileged role or attribute assignments are no longer appropriate.",
    "priority": "P3"
  },
  {
    "id": "ac-2.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Dynamic Account Management",
    "description": "Create, activate, manage, and deactivate [system accounts] dynamically.",
    "priority": "P3",
    "relatedControls": [
      "ac-16"
    ]
  },
  {
    "id": "ac-2.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-2",
    "family": "Access Control",
    "title": "Restrictions on Use of Shared and Group Accounts",
    "description": "Only permit the use of shared and group accounts that meet [conditions].",
    "priority": "P3"
  },
  {
    "id": "ac-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Use of External Systems",
    "description": "[choose: establish {{ insert: param, ac-20_odp.02 }} , identify {{ insert: param, ac-20_odp.03 }} ] , consistent with the trust relationships established with other organizations owning, operating, and/or maintaining external systems, allowing authorized individuals to: Access the system from external systems; and Process, store, or transmit organization-controlled information using external systems; or Prohibit the use of [prohibited types of external systems].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "7dbd6d9f-29d6-4d1d-9766-f2d77ff3c849",
      "f26af0d0-6d72-4a9d-8ecd-01bc21fd4f0e"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-17",
      "ac-19",
      "ca-3",
      "pl-2",
      "pl-4",
      "sa-9",
      "sc-7"
    ]
  },
  {
    "id": "ac-20.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-20",
    "family": "Access Control",
    "title": "Limits on Authorized Use",
    "description": "Permit authorized individuals to use an external system to access the system or to process, store, or transmit organization-controlled information only after: Verification of the implementation of controls on the external system as specified in the organization’s security and privacy policies and security and privacy plans; or Retention of approved system connection or processing agreements with the organizational entity hosting the external system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ca-2"
    ]
  },
  {
    "id": "ac-20.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-20",
    "family": "Access Control",
    "title": "Portable Storage Devices — Restricted Use",
    "description": "Restrict the use of organization-controlled portable storage devices by authorized individuals on external systems using [restrictions].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "mp-7",
      "sc-41"
    ]
  },
  {
    "id": "ac-20.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-20",
    "family": "Access Control",
    "title": "Non-organizationally Owned Systems — Restricted Use",
    "description": "Restrict the use of non-organizationally owned systems or system components to process, store, or transmit organizational information using [restrictions].",
    "priority": "P3"
  },
  {
    "id": "ac-20.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-20",
    "family": "Access Control",
    "title": "Network Accessible Storage Devices — Prohibited Use",
    "description": "Prohibit the use of [network-accessible storage devices] in external systems.",
    "priority": "P3"
  },
  {
    "id": "ac-20.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-20",
    "family": "Access Control",
    "title": "Portable Storage Devices — Prohibited Use",
    "description": "Prohibit the use of organization-controlled portable storage devices by authorized individuals on external systems.",
    "priority": "P3",
    "relatedControls": [
      "mp-7",
      "pl-4",
      "ps-6",
      "sc-41"
    ]
  },
  {
    "id": "ac-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Information Sharing",
    "description": "Enable authorized users to determine whether access authorizations assigned to a sharing partner match the information’s access and use restrictions for [information-sharing circumstances] ; and Employ [automated mechanisms] to assist users in making information sharing and collaboration decisions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "9ef4b43c-42a4-4316-87dc-ffaf528bc05c",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-16",
      "pt-2",
      "pt-7",
      "ra-3",
      "sc-15"
    ]
  },
  {
    "id": "ac-21.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-21",
    "family": "Access Control",
    "title": "Automated Decision Support",
    "description": "Employ [automated mechanisms] to enforce information-sharing decisions by authorized users based on access authorizations of sharing partners and access restrictions on information to be shared.",
    "priority": "P3"
  },
  {
    "id": "ac-21.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-21",
    "family": "Access Control",
    "title": "Information Search and Retrieval",
    "description": "Implement information search and retrieval services that enforce [information-sharing restrictions].",
    "priority": "P3"
  },
  {
    "id": "ac-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Publicly Accessible Content",
    "description": "Designate individuals authorized to make information publicly accessible; Train authorized individuals to ensure that publicly accessible information does not contain nonpublic information; Review the proposed content of information prior to posting onto the publicly accessible system to ensure that nonpublic information is not included; and Review the content on the publicly accessible system for nonpublic information [frequency] and remove such information, if discovered.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455"
    ],
    "relatedControls": [
      "ac-3",
      "at-2",
      "at-3",
      "au-13"
    ]
  },
  {
    "id": "ac-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Data Mining Protection",
    "description": "Employ [techniques] for [data storage objects] to detect and protect against unauthorized data mining.",
    "priority": "P3",
    "references": [
      "0af071a6-cf8e-48ee-8c82-fe91efa20f94"
    ],
    "relatedControls": [
      "pm-12",
      "pt-2"
    ]
  },
  {
    "id": "ac-24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Access Control Decisions",
    "description": "[choose: establish procedures, implement mechanisms] to ensure [access control decisions] are applied to each access request prior to access enforcement.",
    "priority": "P3",
    "references": [
      "2956e175-f674-43f4-b1b9-e074ad9fc39c",
      "388a3aa2-5d85-4bad-b8a3-77db80d63c4f"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3"
    ]
  },
  {
    "id": "ac-24.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-24",
    "family": "Access Control",
    "title": "Transmit Access Authorization Information",
    "description": "Transmit [access authorization information] using [controls] to [systems] that enforce access control decisions.",
    "priority": "P3",
    "relatedControls": [
      "au-10"
    ]
  },
  {
    "id": "ac-24.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-24",
    "family": "Access Control",
    "title": "No User or Process Identity",
    "description": "Enforce access control decisions based on [organization-defined security or privacy attributes] that do not include the identity of the user or process acting on behalf of the user.",
    "priority": "P3"
  },
  {
    "id": "ac-25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Reference Monitor",
    "description": "Implement a reference monitor for [access control policies] that is tamperproof, always invoked, and small enough to be subject to analysis and testing, the completeness of which can be assured.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-16",
      "sa-8",
      "sa-17",
      "sc-3",
      "sc-11",
      "sc-39",
      "si-13"
    ]
  },
  {
    "id": "ac-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Access Enforcement",
    "description": "Enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "2956e175-f674-43f4-b1b9-e074ad9fc39c",
      "388a3aa2-5d85-4bad-b8a3-77db80d63c4f",
      "7f473f21-fdbf-4a6c-81a1-0ab95919609d"
    ],
    "relatedControls": [
      "ac-2",
      "ac-4",
      "ac-5",
      "ac-6",
      "ac-16",
      "ac-17",
      "ac-18",
      "ac-19",
      "ac-20",
      "ac-21",
      "ac-22",
      "ac-24",
      "ac-25",
      "at-2",
      "at-3",
      "au-9",
      "ca-9",
      "cm-5",
      "cm-11",
      "ia-2",
      "ia-5",
      "ia-6",
      "ia-7",
      "ia-11",
      "ia-13",
      "ma-3",
      "ma-4",
      "ma-5",
      "mp-4",
      "pm-2",
      "ps-3",
      "pt-2",
      "pt-3",
      "sa-17",
      "sc-2",
      "sc-3",
      "sc-4",
      "sc-12",
      "sc-13",
      "sc-28",
      "sc-31",
      "sc-34",
      "si-4",
      "si-8"
    ]
  },
  {
    "id": "ac-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Restricted Access to Privileged Functions",
    "description": "Restricted Access to Privileged Functions",
    "priority": "P3"
  },
  {
    "id": "ac-3.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Audited Override of Access Control Mechanisms",
    "description": "Employ an audited override of automated access control mechanisms under [conditions] by [roles].",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-6",
      "au-10",
      "au-12",
      "au-14"
    ]
  },
  {
    "id": "ac-3.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Restrict Access to Specific Information Types",
    "description": "Restrict access to data repositories containing [information types].",
    "priority": "P3",
    "relatedControls": [
      "cm-8",
      "cm-12",
      "cm-13",
      "pm-5"
    ]
  },
  {
    "id": "ac-3.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Assert and Enforce Application Access",
    "description": "Require applications to assert, as part of the installation process, the access needed to the following system applications and functions: [system applications and functions]; Provide an enforcement mechanism to prevent unauthorized access; and Approve access changes after initial installation of the application.",
    "priority": "P3",
    "relatedControls": [
      "cm-7"
    ]
  },
  {
    "id": "ac-3.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Attribute-based Access Control",
    "description": "Enforce attribute-based access control policy over defined subjects and objects and control access based upon [attributes].",
    "priority": "P3"
  },
  {
    "id": "ac-3.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Individual Access",
    "description": "Provide [mechanisms] to enable individuals to have access to the following elements of their personally identifiable information: [elements].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "ia-8",
      "pm-22",
      "pm-20",
      "pm-21",
      "pt-6"
    ]
  },
  {
    "id": "ac-3.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Discretionary and Mandatory Access Control",
    "description": "Enforce [organization-defined mandatory access control policy] over the set of covered subjects and objects specified in the policy; and Enforce [organization-defined discretionary access control policy] over the set of covered subjects and objects specified in the policy.",
    "priority": "P3",
    "relatedControls": [
      "sc-2",
      "sc-3",
      "ac-4"
    ]
  },
  {
    "id": "ac-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Dual Authorization",
    "description": "Enforce dual authorization for [privileged commands and/or other actions].",
    "priority": "P3",
    "relatedControls": [
      "cp-9",
      "mp-6"
    ]
  },
  {
    "id": "ac-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Mandatory Access Control",
    "description": "Enforce [organization-defined mandatory access control policy] over the set of covered subjects and objects specified in the policy, and where the policy: Is uniformly enforced across the covered subjects and objects within the system; Specifies that a subject that has been granted access to information is constrained from doing any of the following; Passing the information to unauthorized subjects or objects; Granting its privileges to other subjects; Changing one or more security attributes (specified by the policy) on subjects, objects, the system, or system components; Choosing the security attributes and attribute values (specified by the policy) to be associated with newly created or modified objects; and Changing the rules governing access control; and Specifies that [subjects] may explicitly be granted [privileges] such that they are not limited by any defined subset (or all) of the above constraints.",
    "priority": "P3",
    "relatedControls": [
      "sc-7"
    ]
  },
  {
    "id": "ac-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Discretionary Access Control",
    "description": "Enforce [organization-defined discretionary access control policy] over the set of covered subjects and objects specified in the policy, and where the policy specifies that a subject that has been granted access to information can do one or more of the following: Pass the information to any other subjects or objects; Grant its privileges to other subjects; Change security attributes on subjects, objects, the system, or the system’s components; Choose the security attributes to be associated with newly created or revised objects; or Change the rules governing access control.",
    "priority": "P3"
  },
  {
    "id": "ac-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Security-relevant Information",
    "description": "Prevent access to [security-relevant information] except during secure, non-operable system states.",
    "priority": "P3",
    "relatedControls": [
      "cm-6",
      "sc-39"
    ]
  },
  {
    "id": "ac-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Protection of User and System Information",
    "description": "Protection of User and System Information",
    "priority": "P3"
  },
  {
    "id": "ac-3.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Role-based Access Control",
    "description": "Enforce a role-based access control policy over defined subjects and objects and control access based upon [organization-defined roles and users authorized to assume such roles].",
    "priority": "P3"
  },
  {
    "id": "ac-3.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Revocation of Access Authorizations",
    "description": "Enforce the revocation of access authorizations resulting from changes to the security attributes of subjects and objects based on [rules].",
    "priority": "P3"
  },
  {
    "id": "ac-3.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-3",
    "family": "Access Control",
    "title": "Controlled Release",
    "description": "Release information outside of the system only if: The receiving [system or system component] provides [controls] ; and [controls] are used to validate the appropriateness of the information designated for release.",
    "priority": "P3",
    "relatedControls": [
      "ca-3",
      "pt-7",
      "pt-8",
      "sa-9",
      "sc-16"
    ]
  },
  {
    "id": "ac-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Information Flow Enforcement",
    "description": "Enforce approved authorizations for controlling the flow of information within the system and between connected systems based on [information flow control policies].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "2956e175-f674-43f4-b1b9-e074ad9fc39c",
      "388a3aa2-5d85-4bad-b8a3-77db80d63c4f",
      "a2590922-82f3-4277-83c0-ca5bee06dba4"
    ],
    "relatedControls": [
      "ac-3",
      "ac-6",
      "ac-16",
      "ac-17",
      "ac-19",
      "ac-21",
      "au-10",
      "ca-3",
      "ca-9",
      "cm-7",
      "pl-9",
      "pm-24",
      "sa-17",
      "sc-4",
      "sc-7",
      "sc-16",
      "sc-31"
    ]
  },
  {
    "id": "ac-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Object Security and Privacy Attributes",
    "description": "Use [organization-defined security and privacy attributes] associated with [organization-defined information, source, and destination objects] to enforce [information flow control policies] as a basis for flow control decisions.",
    "priority": "P3"
  },
  {
    "id": "ac-4.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Enable and Disable Security or Privacy Policy Filters",
    "description": "Provide the capability for privileged administrators to enable and disable [organization-defined security or privacy policy filters] under the following conditions: [organization-defined conditions].",
    "priority": "P3"
  },
  {
    "id": "ac-4.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Configuration of Security or Privacy Policy Filters",
    "description": "Provide the capability for privileged administrators to configure [organization-defined security or privacy policy filters] to support different security or privacy policies.",
    "priority": "P3"
  },
  {
    "id": "ac-4.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Data Type Identifiers",
    "description": "When transferring information between different security domains, use [data type identifiers] to validate data essential for information flow decisions.",
    "priority": "P3"
  },
  {
    "id": "ac-4.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Decomposition into Policy-relevant Subcomponents",
    "description": "When transferring information between different security domains, decompose information into [policy-relevant subcomponents] for submission to policy enforcement mechanisms.",
    "priority": "P3"
  },
  {
    "id": "ac-4.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Security or Privacy Policy Filter Constraints",
    "description": "When transferring information between different security domains, implement [organization-defined security or privacy policy filters] requiring fully enumerated formats that restrict data structure and content.",
    "priority": "P3"
  },
  {
    "id": "ac-4.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Detection of Unsanctioned Information",
    "description": "When transferring information between different security domains, examine the information for the presence of [unsanctioned information] and prohibit the transfer of such information in accordance with the [organization-defined security or privacy policy].",
    "priority": "P3",
    "relatedControls": [
      "si-3"
    ]
  },
  {
    "id": "ac-4.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Information Transfers on Interconnected Systems",
    "description": "Information Transfers on Interconnected Systems",
    "priority": "P3"
  },
  {
    "id": "ac-4.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Domain Authentication",
    "description": "Uniquely identify and authenticate source and destination points by [choose: organization, system, application, service, individual] for information transfer.",
    "priority": "P3",
    "relatedControls": [
      "ia-2",
      "ia-3",
      "ia-9"
    ]
  },
  {
    "id": "ac-4.18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Security Attribute Binding",
    "description": "Security Attribute Binding",
    "priority": "P3"
  },
  {
    "id": "ac-4.19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Validation of Metadata",
    "description": "When transferring information between different security domains, implement [organization-defined security or privacy policy filters] on metadata.",
    "priority": "P3"
  },
  {
    "id": "ac-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Processing Domains",
    "description": "Use protected processing domains to enforce [information flow control policies] as a basis for flow control decisions.",
    "priority": "P3",
    "relatedControls": [
      "sc-39"
    ]
  },
  {
    "id": "ac-4.20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Approved Solutions",
    "description": "Employ [solutions in approved configurations] to control the flow of [information] across security domains.",
    "priority": "P3"
  },
  {
    "id": "ac-4.21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Physical or Logical Separation of Information Flows",
    "description": "Separate information flows logically or physically using [organization-defined mechanisms and/or techniques] to accomplish [required separations].",
    "priority": "P3",
    "relatedControls": [
      "sc-32"
    ]
  },
  {
    "id": "ac-4.22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Access Only",
    "description": "Provide access from a single device to computing platforms, applications, or data residing in multiple different security domains, while preventing information flow between the different security domains.",
    "priority": "P3"
  },
  {
    "id": "ac-4.23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Modify Non-releasable Information",
    "description": "When transferring information between different security domains, modify non-releasable information by implementing [modification action].",
    "priority": "P3"
  },
  {
    "id": "ac-4.24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Internal Normalized Format",
    "description": "When transferring information between different security domains, parse incoming data into an internal normalized format and regenerate the data to be consistent with its intended specification.",
    "priority": "P3"
  },
  {
    "id": "ac-4.25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Data Sanitization",
    "description": "When transferring information between different security domains, sanitize data to minimize [choose: delivery of malicious content, command and control of malicious code, malicious code augmentation, and steganography-encoded data, spillage of sensitive information] in accordance with [policy].",
    "priority": "P3",
    "relatedControls": [
      "mp-6"
    ]
  },
  {
    "id": "ac-4.26",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Audit Filtering Actions",
    "description": "When transferring information between different security domains, record and audit content filtering actions and results for the information being filtered.",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-3",
      "au-12"
    ]
  },
  {
    "id": "ac-4.27",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Redundant/Independent Filtering Mechanisms",
    "description": "When transferring information between different security domains, implement content filtering solutions that provide redundant and independent filtering mechanisms for each data type.",
    "priority": "P3"
  },
  {
    "id": "ac-4.28",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Linear Filter Pipelines",
    "description": "When transferring information between different security domains, implement a linear content filter pipeline that is enforced with discretionary and mandatory access controls.",
    "priority": "P3"
  },
  {
    "id": "ac-4.29",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Filter Orchestration Engines",
    "description": "When transferring information between different security domains, employ content filter orchestration engines to ensure that: Content filtering mechanisms successfully complete execution without errors; and Content filtering actions occur in the correct order and comply with [policy].",
    "priority": "P3"
  },
  {
    "id": "ac-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Dynamic Information Flow Control",
    "description": "Enforce [information flow control policies].",
    "priority": "P3",
    "relatedControls": [
      "si-4"
    ]
  },
  {
    "id": "ac-4.30",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Filter Mechanisms Using Multiple Processes",
    "description": "When transferring information between different security domains, implement content filtering mechanisms using multiple processes.",
    "priority": "P3"
  },
  {
    "id": "ac-4.31",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Failed Content Transfer Prevention",
    "description": "When transferring information between different security domains, prevent the transfer of failed content to the receiving domain.",
    "priority": "P3"
  },
  {
    "id": "ac-4.32",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Process Requirements for Information Transfer",
    "description": "When transferring information between different security domains, the process that transfers information between filter pipelines: Does not filter message content; Validates filtering metadata; Ensures the content associated with the filtering metadata has successfully completed filtering; and Transfers the content to the destination filter pipeline.",
    "priority": "P3"
  },
  {
    "id": "ac-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Flow Control of Encrypted Information",
    "description": "Prevent encrypted information from bypassing [information flow control mechanisms] by [choose: decrypting the information, blocking the flow of the encrypted information, terminating communications sessions attempting to pass encrypted information, {{ insert: param, ac-04.04_odp.03 }} ].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "si-4"
    ]
  },
  {
    "id": "ac-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Embedded Data Types",
    "description": "Enforce [limitations] on embedding data types within other data types.",
    "priority": "P3"
  },
  {
    "id": "ac-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Metadata",
    "description": "Enforce information flow control based on [metadata].",
    "priority": "P3",
    "relatedControls": [
      "ac-16",
      "si-7"
    ]
  },
  {
    "id": "ac-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "One-way Flow Mechanisms",
    "description": "Enforce one-way information flows through hardware-based flow control mechanisms.",
    "priority": "P3"
  },
  {
    "id": "ac-4.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Security and Privacy Policy Filters",
    "description": "Enforce information flow control using [organization-defined security or privacy policy filters] as a basis for flow control decisions for [organization-defined information flows] ; and [choose: block, strip, modify, quarantine] data after a filter processing failure in accordance with [organization-defined security or privacy policy].",
    "priority": "P3"
  },
  {
    "id": "ac-4.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-4",
    "family": "Access Control",
    "title": "Human Reviews",
    "description": "Enforce the use of human reviews for [information flows] under the following conditions: [conditions].",
    "priority": "P3"
  },
  {
    "id": "ac-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Separation of Duties",
    "description": "Identify and document [duties of individuals] ; and Define system access authorizations to support separation of duties.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-6",
      "au-9",
      "cm-5",
      "cm-11",
      "cp-9",
      "ia-2",
      "ia-4",
      "ia-5",
      "ia-12",
      "ma-3",
      "ma-5",
      "ps-2",
      "sa-8",
      "sa-17"
    ]
  },
  {
    "id": "ac-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Least Privilege",
    "description": "Employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) that are necessary to accomplish assigned organizational tasks.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-5",
      "ac-16",
      "cm-5",
      "cm-11",
      "pl-2",
      "pm-12",
      "sa-8",
      "sa-15",
      "sa-17",
      "sc-38"
    ]
  },
  {
    "id": "ac-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Authorize Access to Security Functions",
    "description": "Authorize access for [individuals and roles] to: [organization-defined security functions (deployed in hardware, software, and firmware)] ; and [security-relevant information].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "ac-19",
      "au-9",
      "pe-2"
    ]
  },
  {
    "id": "ac-6.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Prohibit Non-privileged Users from Executing Privileged Functions",
    "description": "Prevent non-privileged users from executing privileged functions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ac-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Non-privileged Access for Nonsecurity Functions",
    "description": "Require that users of system accounts (or roles) with access to [security functions or security-relevant information] use non-privileged accounts or roles, when accessing nonsecurity functions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "ac-19",
      "pl-4"
    ]
  },
  {
    "id": "ac-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Network Access to Privileged Commands",
    "description": "Authorize network access to [privileged commands] only for [compelling operational needs] and document the rationale for such access in the security plan for the system.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "ac-19"
    ]
  },
  {
    "id": "ac-6.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Separate Processing Domains",
    "description": "Provide separate processing domains to enable finer-grained allocation of user privileges.",
    "priority": "P3",
    "relatedControls": [
      "ac-4",
      "sc-2",
      "sc-3",
      "sc-30",
      "sc-32",
      "sc-39"
    ]
  },
  {
    "id": "ac-6.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Privileged Accounts",
    "description": "Restrict privileged accounts on the system to [personnel or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ia-2",
      "ma-3",
      "ma-4"
    ]
  },
  {
    "id": "ac-6.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Privileged Access by Non-organizational Users",
    "description": "Prohibit privileged access to the system by non-organizational users.",
    "priority": "P3",
    "relatedControls": [
      "ac-18",
      "ac-19",
      "ia-2",
      "ia-8"
    ]
  },
  {
    "id": "ac-6.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Review of User Privileges",
    "description": "Review [frequency] the privileges assigned to [roles and classes] to validate the need for such privileges; and Reassign or remove privileges, if necessary, to correctly reflect organizational mission and business needs.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ca-7"
    ]
  },
  {
    "id": "ac-6.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Privilege Levels for Code Execution",
    "description": "Prevent the following software from executing at higher privilege levels than users executing the software: [software].",
    "priority": "P3"
  },
  {
    "id": "ac-6.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-6",
    "family": "Access Control",
    "title": "Log Use of Privileged Functions",
    "description": "Log the execution of privileged functions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-3",
      "au-12"
    ]
  },
  {
    "id": "ac-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Unsuccessful Logon Attempts",
    "description": "Enforce a limit of [number] consecutive invalid logon attempts by a user during a [time period] ; and Automatically [choose: lock the account or node for {{ insert: param, ac-07_odp.04 }} , lock the account or node until released by an administrator, delay next logon prompt per {{ insert: param, ac-07_odp.05 }} , notify system administrator, take other {{ insert: param, ac-07_odp.06 }} ] when the maximum number of unsuccessful attempts is exceeded.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394"
    ],
    "relatedControls": [
      "ac-2",
      "ac-9",
      "au-2",
      "au-6",
      "ia-5"
    ]
  },
  {
    "id": "ac-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-7",
    "family": "Access Control",
    "title": "Automatic Account Lock",
    "description": "Automatic Account Lock",
    "priority": "P3"
  },
  {
    "id": "ac-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-7",
    "family": "Access Control",
    "title": "Purge or Wipe Mobile Device",
    "description": "Purge or wipe information from [mobile devices] based on [purging or wiping requirements and techniques] after [number] consecutive, unsuccessful device logon attempts.",
    "priority": "P3",
    "relatedControls": [
      "ac-19",
      "mp-5",
      "mp-6"
    ]
  },
  {
    "id": "ac-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-7",
    "family": "Access Control",
    "title": "Biometric Attempt Limiting",
    "description": "Limit the number of unsuccessful biometric logon attempts to [number].",
    "priority": "P3",
    "relatedControls": [
      "ia-3"
    ]
  },
  {
    "id": "ac-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-7",
    "family": "Access Control",
    "title": "Use of Alternate Authentication Factor",
    "description": "Allow the use of [authentication factors] that are different from the primary authentication factors after the number of organization-defined consecutive invalid logon attempts have been exceeded; and Enforce a limit of [number] consecutive invalid logon attempts through use of the alternative factors by a user during a [time period].",
    "priority": "P3",
    "relatedControls": [
      "ia-3"
    ]
  },
  {
    "id": "ac-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "System Use Notification",
    "description": "Display [system use notification] to users before granting access to the system that provides privacy and security notices consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines and state that: Users are accessing a U.S. Government system; System usage may be monitored, recorded, and subject to audit; Unauthorized use of the system is prohibited and subject to criminal and civil penalties; and Use of the system indicates consent to monitoring and recording; Retain the notification message or banner on the screen until users acknowledge the usage conditions and take explicit actions to log on to or further access the system; and For publicly accessible systems: Display system use information [conditions] , before granting further access to the publicly accessible system; Display references, if any, to monitoring, recording, or auditing that are consistent with privacy accommodations for such systems that generally prohibit those activities; and Include a description of the authorized uses of the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-14",
      "pl-4",
      "si-4"
    ]
  },
  {
    "id": "ac-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Access Control",
    "title": "Previous Logon Notification",
    "description": "Notify the user, upon successful logon to the system, of the date and time of the last logon.",
    "priority": "P3",
    "relatedControls": [
      "ac-7",
      "pl-4"
    ]
  },
  {
    "id": "ac-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-9",
    "family": "Access Control",
    "title": "Unsuccessful Logons",
    "description": "Notify the user, upon successful logon, of the number of unsuccessful logon attempts since the last successful logon.",
    "priority": "P3"
  },
  {
    "id": "ac-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-9",
    "family": "Access Control",
    "title": "Successful and Unsuccessful Logons",
    "description": "Notify the user, upon successful logon, of the number of [choose: successful logons, unsuccessful logon attempts, both] during [time period].",
    "priority": "P3"
  },
  {
    "id": "ac-9.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-9",
    "family": "Access Control",
    "title": "Notification of Account Changes",
    "description": "Notify the user, upon successful logon, of changes to [security-related characteristics or parameters] during [time period].",
    "priority": "P3"
  },
  {
    "id": "ac-9.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ac-9",
    "family": "Access Control",
    "title": "Additional Logon Information",
    "description": "Notify the user, upon successful logon, of the following additional information: [additional information].",
    "priority": "P3"
  },
  {
    "id": "at-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] awareness and training policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the awareness and training policy and the associated awareness and training controls; Designate an [official] to manage the development, documentation, and dissemination of the awareness and training policy and procedures; and Review and update the current awareness and training: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "511f6832-23ca-49a3-8c0f-ce493373cab8",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "at-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Literacy Training and Awareness",
    "description": "Provide security and privacy literacy training to system users (including managers, senior executives, and contractors): As part of initial training for new users and [organization-defined frequency] thereafter; and When required by system changes or following [organization-defined events]; Employ the following techniques to increase the security and privacy awareness of system users [awareness techniques]; Update literacy training and awareness content [frequency] and following [events] ; and Incorporate lessons learned from internal or external security incidents or breaches into literacy training and awareness techniques.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "511f6832-23ca-49a3-8c0f-ce493373cab8",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f",
      "89f2a08d-fc49-46d0-856e-bf974c9b1573"
    ],
    "relatedControls": [
      "ac-3",
      "ac-17",
      "ac-22",
      "at-3",
      "at-4",
      "cp-3",
      "ia-4",
      "ir-2",
      "ir-7",
      "ir-9",
      "pl-4",
      "pm-13",
      "pm-21",
      "ps-7",
      "pt-2",
      "sa-8",
      "sa-16"
    ]
  },
  {
    "id": "at-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Practical Exercises",
    "description": "Provide practical exercises in literacy training that simulate events and incidents.",
    "priority": "P3",
    "relatedControls": [
      "ca-2",
      "ca-7",
      "cp-4",
      "ir-3"
    ]
  },
  {
    "id": "at-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Insider Threat",
    "description": "Provide literacy training on recognizing and reporting potential indicators of insider threat.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "pm-12"
    ]
  },
  {
    "id": "at-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Social Engineering and Mining",
    "description": "Provide literacy training on recognizing and reporting potential and actual instances of social engineering and social mining.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "at-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Suspicious Communications and Anomalous System Behavior",
    "description": "Provide literacy training on recognizing suspicious communications and anomalous behavior in organizational systems using [indicators of malicious code].",
    "priority": "P3"
  },
  {
    "id": "at-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Advanced Persistent Threat",
    "description": "Provide literacy training on the advanced persistent threat.",
    "priority": "P3"
  },
  {
    "id": "at-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-2",
    "family": "Awareness and Training",
    "title": "Cyber Threat Environment",
    "description": "Provide literacy training on the cyber threat environment; and Reflect current cyber threat information in system operations.",
    "priority": "P3",
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "at-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Role-based Training",
    "description": "Provide role-based security and privacy training to personnel with the following roles and responsibilities: [organization-defined roles and responsibilities]: Before authorizing access to the system, information, or performing assigned duties, and [frequency] thereafter; and When required by system changes; Update role-based training content [frequency] and following [events] ; and Incorporate lessons learned from internal or external security incidents or breaches into role-based training.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "511f6832-23ca-49a3-8c0f-ce493373cab8",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ],
    "relatedControls": [
      "ac-3",
      "ac-17",
      "ac-22",
      "at-2",
      "at-4",
      "cp-3",
      "ir-2",
      "ir-4",
      "ir-7",
      "ir-9",
      "pl-4",
      "pm-13",
      "pm-23",
      "ps-7",
      "ps-9",
      "sa-3",
      "sa-8",
      "sa-11",
      "sa-16",
      "sr-5",
      "sr-6",
      "sr-11"
    ]
  },
  {
    "id": "at-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-3",
    "family": "Awareness and Training",
    "title": "Environmental Controls",
    "description": "Provide [personnel or roles] with initial and [frequency] training in the employment and operation of environmental controls.",
    "priority": "P3",
    "relatedControls": [
      "pe-1",
      "pe-11",
      "pe-13",
      "pe-14",
      "pe-15"
    ]
  },
  {
    "id": "at-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-3",
    "family": "Awareness and Training",
    "title": "Physical Security Controls",
    "description": "Provide [personnel or roles] with initial and [frequency] training in the employment and operation of physical security controls.",
    "priority": "P3",
    "relatedControls": [
      "pe-2",
      "pe-3",
      "pe-4"
    ]
  },
  {
    "id": "at-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-3",
    "family": "Awareness and Training",
    "title": "Practical Exercises",
    "description": "Provide practical exercises in security and privacy training that reinforce training objectives.",
    "priority": "P3"
  },
  {
    "id": "at-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-3",
    "family": "Awareness and Training",
    "title": "Suspicious Communications and Anomalous System Behavior",
    "description": "Suspicious Communications and Anomalous System Behavior",
    "priority": "P3"
  },
  {
    "id": "at-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "at-3",
    "family": "Awareness and Training",
    "title": "Processing Personally Identifiable Information",
    "description": "Provide [personnel or roles] with initial and [frequency] training in the employment and operation of personally identifiable information processing and transparency controls.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pt-2",
      "pt-3",
      "pt-5",
      "pt-6"
    ]
  },
  {
    "id": "at-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Training Records",
    "description": "Document and monitor information security and privacy training activities, including security and privacy awareness training and specific role-based security and privacy training; and Retain individual training records for [time period].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "cp-3",
      "ir-2",
      "pm-14",
      "si-12"
    ]
  },
  {
    "id": "at-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Contacts with Security Groups and Associations",
    "description": "Contacts with Security Groups and Associations",
    "priority": "P3"
  },
  {
    "id": "at-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Awareness and Training",
    "title": "Training Feedback",
    "description": "Provide feedback on organizational training results to the following personnel [frequency]: [personnel].",
    "priority": "P3"
  },
  {
    "id": "au-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] audit and accountability policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the audit and accountability policy and the associated audit and accountability controls; Designate an [official] to manage the development, documentation, and dissemination of the audit and accountability policy and procedures; and Review and update the current audit and accountability: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "au-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Non-repudiation",
    "description": "Provide irrefutable evidence that an individual (or process acting on behalf of an individual) has performed [actions].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "1c71b420-2bd9-4e52-9fc8-390f58b85b59"
    ],
    "relatedControls": [
      "au-9",
      "pm-12",
      "sa-8",
      "sc-8",
      "sc-12",
      "sc-13",
      "sc-16",
      "sc-17",
      "sc-23"
    ]
  },
  {
    "id": "au-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-10",
    "family": "Audit and Accountability",
    "title": "Association of Identities",
    "description": "Bind the identity of the information producer with the information to [strength of binding] ; and Provide the means for authorized individuals to determine the identity of the producer of the information.",
    "priority": "P3",
    "relatedControls": [
      "ac-4",
      "ac-16"
    ]
  },
  {
    "id": "au-10.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-10",
    "family": "Audit and Accountability",
    "title": "Validate Binding of Information Producer Identity",
    "description": "Validate the binding of the information producer identity to the information at [frequency] ; and Perform [actions] in the event of a validation error.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-16"
    ]
  },
  {
    "id": "au-10.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-10",
    "family": "Audit and Accountability",
    "title": "Chain of Custody",
    "description": "Maintain reviewer or releaser credentials within the established chain of custody for information reviewed or released.",
    "priority": "P3",
    "relatedControls": [
      "ac-4",
      "ac-16"
    ]
  },
  {
    "id": "au-10.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-10",
    "family": "Audit and Accountability",
    "title": "Validate Binding of Information Reviewer Identity",
    "description": "Validate the binding of the information reviewer identity to the information at the transfer or release points prior to release or transfer between [security domains] ; and Perform [actions] in the event of a validation error.",
    "priority": "P3",
    "relatedControls": [
      "ac-4",
      "ac-16"
    ]
  },
  {
    "id": "au-10.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-10",
    "family": "Audit and Accountability",
    "title": "Digital Signatures",
    "description": "Digital Signatures",
    "priority": "P3"
  },
  {
    "id": "au-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Audit Record Retention",
    "description": "Retain audit records for [time period] to provide support for after-the-fact investigations of incidents and to meet regulatory and organizational information retention requirements.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "au-2",
      "au-4",
      "au-5",
      "au-6",
      "au-9",
      "au-14",
      "mp-6",
      "ra-5",
      "si-12"
    ]
  },
  {
    "id": "au-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-11",
    "family": "Audit and Accountability",
    "title": "Long-term Retrieval Capability",
    "description": "Employ [measures] to ensure that long-term audit records generated by the system can be retrieved.",
    "priority": "P3"
  },
  {
    "id": "au-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Audit Record Generation",
    "description": "Provide audit record generation capability for the event types the system is capable of auditing as defined in [AU-2a](#au-2_smt.a) on [system components]; Allow [personnel or roles] to select the event types that are to be logged by specific components of the system; and Generate audit records for the event types defined in [AU-2c](#au-2_smt.c) that include the audit record content defined in [AU-3](#au-3).",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-6",
      "ac-17",
      "au-2",
      "au-3",
      "au-4",
      "au-5",
      "au-6",
      "au-7",
      "au-14",
      "cm-5",
      "ma-4",
      "mp-4",
      "pm-12",
      "sa-8",
      "sc-18",
      "si-3",
      "si-4",
      "si-7",
      "si-10"
    ]
  },
  {
    "id": "au-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-12",
    "family": "Audit and Accountability",
    "title": "System-wide and Time-correlated Audit Trail",
    "description": "Compile audit records from [system components] into a system-wide (logical or physical) audit trail that is time-correlated to within [level of tolerance].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-8",
      "sc-45"
    ]
  },
  {
    "id": "au-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-12",
    "family": "Audit and Accountability",
    "title": "Standardized Formats",
    "description": "Produce a system-wide (logical or physical) audit trail composed of audit records in a standardized format.",
    "priority": "P3"
  },
  {
    "id": "au-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-12",
    "family": "Audit and Accountability",
    "title": "Changes by Authorized Individuals",
    "description": "Provide and implement the capability for [individuals or roles] to change the logging to be performed on [system components] based on [selectable event criteria] within [time thresholds].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "au-12.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-12",
    "family": "Audit and Accountability",
    "title": "Query Parameter Audits of Personally Identifiable Information",
    "description": "Provide and implement the capability for auditing the parameters of user query events for data sets containing personally identifiable information.",
    "priority": "P3"
  },
  {
    "id": "au-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Monitoring for Information Disclosure",
    "description": "Monitor [open-source information and/or information sites] [frequency] for evidence of unauthorized disclosure of organizational information; and If an information disclosure is discovered: Notify [personnel or roles] ; and Take the following additional actions: [additional actions].",
    "priority": "P3",
    "relatedControls": [
      "ac-22",
      "pe-3",
      "pm-12",
      "ra-5",
      "sc-7",
      "si-20"
    ]
  },
  {
    "id": "au-13.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-13",
    "family": "Audit and Accountability",
    "title": "Use of Automated Tools",
    "description": "Monitor open-source information and information sites using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "au-13.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-13",
    "family": "Audit and Accountability",
    "title": "Review of Monitored Sites",
    "description": "Review the list of open-source information sites being monitored [frequency].",
    "priority": "P3"
  },
  {
    "id": "au-13.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-13",
    "family": "Audit and Accountability",
    "title": "Unauthorized Replication of Information",
    "description": "Employ discovery techniques, processes, and tools to determine if external entities are replicating organizational information in an unauthorized manner.",
    "priority": "P3"
  },
  {
    "id": "au-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Session Audit",
    "description": "Provide and implement the capability for [users or roles] to [choose: record, view, hear, log] the content of a user session under [circumstances] ; and Develop, integrate, and use session auditing activities in consultation with legal counsel and in accordance with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-8",
      "au-2",
      "au-3",
      "au-4",
      "au-5",
      "au-8",
      "au-9",
      "au-11",
      "au-12"
    ]
  },
  {
    "id": "au-14.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-14",
    "family": "Audit and Accountability",
    "title": "System Start-up",
    "description": "Initiate session audits automatically at system start-up.",
    "priority": "P3"
  },
  {
    "id": "au-14.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-14",
    "family": "Audit and Accountability",
    "title": "Capture and Record Content",
    "description": "Capture and Record Content",
    "priority": "P3"
  },
  {
    "id": "au-14.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-14",
    "family": "Audit and Accountability",
    "title": "Remote Viewing and Listening",
    "description": "Provide and implement the capability for authorized users to remotely view and hear content related to an established user session in real time.",
    "priority": "P3",
    "relatedControls": [
      "ac-17"
    ]
  },
  {
    "id": "au-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Alternate Audit Logging Capability",
    "description": "Alternate Audit Logging Capability",
    "priority": "P3"
  },
  {
    "id": "au-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Cross-organizational Audit Logging",
    "description": "Employ [methods] for coordinating [audit information] among external organizations when audit information is transmitted across organizational boundaries.",
    "priority": "P3",
    "relatedControls": [
      "au-3",
      "au-6",
      "au-7",
      "ca-3",
      "pt-7"
    ]
  },
  {
    "id": "au-16.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-16",
    "family": "Audit and Accountability",
    "title": "Identity Preservation",
    "description": "Preserve the identity of individuals in cross-organizational audit trails.",
    "priority": "P3",
    "relatedControls": [
      "ia-2",
      "ia-4",
      "ia-5",
      "ia-8"
    ]
  },
  {
    "id": "au-16.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-16",
    "family": "Audit and Accountability",
    "title": "Sharing of Audit Information",
    "description": "Provide cross-organizational audit information to [organizations] based on [cross-organizational sharing agreements].",
    "priority": "P3",
    "relatedControls": [
      "ir-4",
      "si-4"
    ]
  },
  {
    "id": "au-16.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-16",
    "family": "Audit and Accountability",
    "title": "Disassociability",
    "description": "Implement [measures] to disassociate individuals from audit information transmitted across organizational boundaries.",
    "priority": "P3"
  },
  {
    "id": "au-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Event Logging",
    "description": "Identify the types of events that the system is capable of logging in support of the audit function: [event types]; Coordinate the event logging function with other organizational entities requiring audit-related information to guide and inform the selection criteria for events to be logged; Specify the following event types for logging within the system: [organization-defined event types (subset of the event types defined in [AU-2a.](#au-2_smt.a)) along with the frequency of (or situation requiring) logging for each identified event type]; Provide a rationale for why the event types selected for logging are deemed to be adequate to support after-the-fact investigations of incidents; and Review and update the event types selected for logging [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "5eee45d8-3313-4fdc-8d54-1742092bbdd6"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-6",
      "ac-7",
      "ac-8",
      "ac-16",
      "ac-17",
      "au-3",
      "au-4",
      "au-5",
      "au-6",
      "au-7",
      "au-11",
      "au-12",
      "cm-3",
      "cm-5",
      "cm-6",
      "cm-13",
      "ia-3",
      "ma-4",
      "mp-4",
      "pe-3",
      "pm-21",
      "pt-2",
      "pt-7",
      "ra-8",
      "sa-8",
      "sc-7",
      "sc-18",
      "si-3",
      "si-4",
      "si-7",
      "si-10",
      "si-11"
    ]
  },
  {
    "id": "au-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-2",
    "family": "Audit and Accountability",
    "title": "Compilation of Audit Records from Multiple Sources",
    "description": "Compilation of Audit Records from Multiple Sources",
    "priority": "P3"
  },
  {
    "id": "au-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-2",
    "family": "Audit and Accountability",
    "title": "Selection of Audit Events by Component",
    "description": "Selection of Audit Events by Component",
    "priority": "P3"
  },
  {
    "id": "au-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-2",
    "family": "Audit and Accountability",
    "title": "Reviews and Updates",
    "description": "Reviews and Updates",
    "priority": "P3"
  },
  {
    "id": "au-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-2",
    "family": "Audit and Accountability",
    "title": "Privileged Functions",
    "description": "Privileged Functions",
    "priority": "P3"
  },
  {
    "id": "au-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Content of Audit Records",
    "description": "Ensure that audit records contain information that establishes the following: What type of event occurred; When the event occurred; Where the event occurred; Source of the event; Outcome of the event; and Identity of any individuals, subjects, or objects/entities associated with the event.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "au-2",
      "au-8",
      "au-12",
      "au-14",
      "ma-4",
      "pl-9",
      "sa-8",
      "si-7",
      "si-11"
    ]
  },
  {
    "id": "au-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-3",
    "family": "Audit and Accountability",
    "title": "Additional Audit Information",
    "description": "Generate audit records containing the following additional information: [additional information].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "au-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-3",
    "family": "Audit and Accountability",
    "title": "Centralized Management of Planned Audit Record Content",
    "description": "Centralized Management of Planned Audit Record Content",
    "priority": "P3"
  },
  {
    "id": "au-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-3",
    "family": "Audit and Accountability",
    "title": "Limit Personally Identifiable Information Elements",
    "description": "Limit personally identifiable information contained in audit records to the following elements identified in the privacy risk assessment: [elements].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "au-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Audit Log Storage Capacity",
    "description": "Allocate audit log storage capacity to accommodate [audit log retention requirements].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-5",
      "au-6",
      "au-7",
      "au-9",
      "au-11",
      "au-12",
      "au-14",
      "si-4"
    ]
  },
  {
    "id": "au-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-4",
    "family": "Audit and Accountability",
    "title": "Transfer to Alternate Storage",
    "description": "Transfer audit logs [frequency] to a different system, system component, or media other than the system or system component conducting the logging.",
    "priority": "P3"
  },
  {
    "id": "au-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Response to Audit Logging Process Failures",
    "description": "Alert [personnel or roles] within [time period] in the event of an audit logging process failure; and Take the following additional actions: [additional actions].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-4",
      "au-7",
      "au-9",
      "au-11",
      "au-12",
      "au-14",
      "si-4",
      "si-12"
    ]
  },
  {
    "id": "au-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-5",
    "family": "Audit and Accountability",
    "title": "Storage Capacity Warning",
    "description": "Provide a warning to [personnel, roles, and/or locations] within [time period] when allocated audit log storage volume reaches [percentage] of repository maximum audit log storage capacity.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "au-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-5",
    "family": "Audit and Accountability",
    "title": "Real-time Alerts",
    "description": "Provide an alert within [real-time period] to [personnel, roles, and/or locations] when the following audit failure events occur: [audit logging failure events requiring real-time alerts].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "au-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-5",
    "family": "Audit and Accountability",
    "title": "Configurable Traffic Volume Thresholds",
    "description": "Enforce configurable network communications traffic volume thresholds reflecting limits on audit log storage capacity and [choose: reject, delay] network traffic above those thresholds.",
    "priority": "P3"
  },
  {
    "id": "au-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-5",
    "family": "Audit and Accountability",
    "title": "Shutdown on Failure",
    "description": "Invoke a [choose: full system shutdown, partial system shutdown, degraded operational mode with limited mission or business functionality available] in the event of [audit logging failures] , unless an alternate audit logging capability exists.",
    "priority": "P3",
    "relatedControls": [
      "au-15"
    ]
  },
  {
    "id": "au-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-5",
    "family": "Audit and Accountability",
    "title": "Alternate Audit Logging Capability",
    "description": "Provide an alternate audit logging capability in the event of a failure in primary audit logging capability that implements [alternate audit logging functionality].",
    "priority": "P3",
    "relatedControls": [
      "au-9"
    ]
  },
  {
    "id": "au-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Audit Record Review, Analysis, and Reporting",
    "description": "Review and analyze system audit records [frequency] for indications of [inappropriate or unusual activity] and the potential impact of the inappropriate or unusual activity; Report findings to [personnel or roles] ; and Adjust the level of audit record review, analysis, and reporting within the system when there is a change in risk based on law enforcement information, intelligence information, or other credible sources of information.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "cfdb1858-c473-46b3-89f9-a700308d0be2",
      "10cf2fad-a216-41f9-bb1a-531b7e3119e3"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-5",
      "ac-6",
      "ac-7",
      "ac-17",
      "au-7",
      "au-16",
      "ca-2",
      "ca-7",
      "cm-2",
      "cm-5",
      "cm-6",
      "cm-10",
      "cm-11",
      "ia-2",
      "ia-3",
      "ia-5",
      "ia-8",
      "ir-5",
      "ma-4",
      "mp-4",
      "pe-3",
      "pe-6",
      "ra-5",
      "sa-8",
      "sc-7",
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "au-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Automated Process Integration",
    "description": "Integrate audit record review, analysis, and reporting processes using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "pm-7"
    ]
  },
  {
    "id": "au-6.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Audit Level Adjustment",
    "description": "Audit Level Adjustment",
    "priority": "P3"
  },
  {
    "id": "au-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Automated Security Alerts",
    "description": "Automated Security Alerts",
    "priority": "P3"
  },
  {
    "id": "au-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Correlate Audit Record Repositories",
    "description": "Analyze and correlate audit records across different repositories to gain organization-wide situational awareness.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-12",
      "ir-4"
    ]
  },
  {
    "id": "au-6.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Central Review and Analysis",
    "description": "Provide and implement the capability to centrally review and analyze audit records from multiple components within the system.",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-12"
    ]
  },
  {
    "id": "au-6.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Integrated Analysis of Audit Records",
    "description": "Integrate analysis of audit records with analysis of [choose: vulnerability scanning information, performance data, system monitoring information, {{ insert: param, au-06.05_odp.02 }} ] to further enhance the ability to identify inappropriate or unusual activity.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-12",
      "ir-4"
    ]
  },
  {
    "id": "au-6.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Correlation with Physical Monitoring",
    "description": "Correlate information from audit records with information obtained from monitoring physical access to further enhance the ability to identify suspicious, inappropriate, unusual, or malevolent activity.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "au-6.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Permitted Actions",
    "description": "Specify the permitted actions for each [choose: system process, role, user] associated with the review, analysis, and reporting of audit record information.",
    "priority": "P3"
  },
  {
    "id": "au-6.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Full Text Analysis of Privileged Commands",
    "description": "Perform a full text analysis of logged privileged commands in a physically distinct component or subsystem of the system, or other system that is dedicated to that analysis.",
    "priority": "P3",
    "relatedControls": [
      "au-3",
      "au-9",
      "au-11",
      "au-12"
    ]
  },
  {
    "id": "au-6.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-6",
    "family": "Audit and Accountability",
    "title": "Correlation with Information from Nontechnical Sources",
    "description": "Correlate information from nontechnical sources with audit record information to enhance organization-wide situational awareness.",
    "priority": "P3",
    "relatedControls": [
      "pm-12"
    ]
  },
  {
    "id": "au-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Audit Record Reduction and Report Generation",
    "description": "Provide and implement an audit record reduction and report generation capability that: Supports on-demand audit record review, analysis, and reporting requirements and after-the-fact investigations of incidents; and Does not alter the original content or time ordering of audit records.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "au-2",
      "au-3",
      "au-4",
      "au-5",
      "au-6",
      "au-12",
      "au-16",
      "cm-5",
      "ia-5",
      "ir-4",
      "pm-12",
      "si-4"
    ]
  },
  {
    "id": "au-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-7",
    "family": "Audit and Accountability",
    "title": "Automatic Processing",
    "description": "Provide and implement the capability to process, sort, and search audit records for events of interest based on the following content: [fields within audit records].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "au-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-7",
    "family": "Audit and Accountability",
    "title": "Automatic Sort and Search",
    "description": "Automatic Sort and Search",
    "priority": "P3"
  },
  {
    "id": "au-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Time Stamps",
    "description": "Use internal system clocks to generate time stamps for audit records; and Record time stamps for audit records that meet [granularity of time measurement] and that use Coordinated Universal Time, have a fixed local time offset from Coordinated Universal Time, or that include the local time offset as part of the time stamp.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "au-3",
      "au-12",
      "au-14",
      "sc-45"
    ]
  },
  {
    "id": "au-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-8",
    "family": "Audit and Accountability",
    "title": "Synchronization with Authoritative Time Source",
    "description": "Synchronization with Authoritative Time Source",
    "priority": "P3"
  },
  {
    "id": "au-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-8",
    "family": "Audit and Accountability",
    "title": "Secondary Authoritative Time Source",
    "description": "Secondary Authoritative Time Source",
    "priority": "P3"
  },
  {
    "id": "au-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Audit and Accountability",
    "title": "Protection of Audit Information",
    "description": "Protect audit information and audit logging tools from unauthorized access, modification, and deletion; and Alert [personnel or roles] upon detection of unauthorized access, modification, or deletion of audit information.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "a295ca19-8c75-4b4c-8800-98024732e181"
    ],
    "relatedControls": [
      "ac-3",
      "ac-6",
      "au-6",
      "au-11",
      "au-14",
      "au-15",
      "mp-2",
      "mp-4",
      "pe-2",
      "pe-3",
      "pe-6",
      "sa-8",
      "sc-8",
      "si-4"
    ]
  },
  {
    "id": "au-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Hardware Write-once Media",
    "description": "Write audit trails to hardware-enforced, write-once media.",
    "priority": "P3",
    "relatedControls": [
      "au-4",
      "au-5"
    ]
  },
  {
    "id": "au-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Store on Separate Physical Systems or Components",
    "description": "Store audit records [frequency] in a repository that is part of a physically different system or system component than the system or component being audited.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-4",
      "au-5"
    ]
  },
  {
    "id": "au-9.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Cryptographic Protection",
    "description": "Implement cryptographic mechanisms to protect the integrity of audit information and audit tools.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-10",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "au-9.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Access by Subset of Privileged Users",
    "description": "Authorize access to management of audit logging functionality to only [subset of privileged users or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-5"
    ]
  },
  {
    "id": "au-9.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Dual Authorization",
    "description": "Enforce dual authorization for [choose: movement, deletion] of [audit information].",
    "priority": "P3",
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "au-9.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Read-only Access",
    "description": "Authorize read-only access to audit information to [subset of privileged users or roles].",
    "priority": "P3"
  },
  {
    "id": "au-9.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "au-9",
    "family": "Audit and Accountability",
    "title": "Store on Component with Different Operating System",
    "description": "Store audit information on a component running a different operating system than the system or component being audited.",
    "priority": "P3",
    "relatedControls": [
      "au-4",
      "au-5",
      "au-11",
      "sc-29"
    ]
  },
  {
    "id": "ca-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] assessment, authorization, and monitoring policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the assessment, authorization, and monitoring policy and the associated assessment, authorization, and monitoring controls; Designate an [official] to manage the development, documentation, and dissemination of the assessment, authorization, and monitoring policy and procedures; and Review and update the current assessment, authorization, and monitoring: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb",
      "62ea77ca-e450-4323-b210-e0d75390e785",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ca-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Control Assessments",
    "description": "Select the appropriate assessor or assessment team for the type of assessment to be conducted; Develop a control assessment plan that describes the scope of the assessment including: Controls and control enhancements under assessment; Assessment procedures to be used to determine control effectiveness; and Assessment environment, assessment team, and assessment roles and responsibilities; Ensure the control assessment plan is reviewed and approved by the authorizing official or designated representative prior to conducting the assessment; Assess the controls in the system and its environment of operation [assessment frequency] to determine the extent to which the controls are implemented correctly, operating as intended, and producing the desired outcome with respect to meeting established security and privacy requirements; Produce a control assessment report that document the results of the assessment; and Provide the results of the control assessment to [individuals or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "30eb758a-2707-4bca-90ad-949a74d4eb16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "122177fa-c4ed-485d-8345-3082c0fb9a06",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb",
      "bbac9fc2-df5b-4f2d-bf99-90d0ade45349",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "ac-20",
      "ca-5",
      "ca-6",
      "ca-7",
      "pm-9",
      "ra-5",
      "ra-10",
      "sa-11",
      "sc-38",
      "si-3",
      "si-12",
      "sr-2",
      "sr-3"
    ]
  },
  {
    "id": "ca-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-2",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Independent Assessors",
    "description": "Employ independent assessors or assessment teams to conduct control assessments.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ca-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-2",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Specialized Assessments",
    "description": "Include as part of control assessments, [specialized assessment frequency], [choose: announced, unannounced], [choose: in-depth monitoring, security instrumentation, automated security test cases, vulnerability scanning, malicious user testing, insider threat assessment, performance and load testing, data leakage or data loss assessment, {{ insert: param, ca-02.02_odp.04 }} ].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "pe-3",
      "si-2"
    ]
  },
  {
    "id": "ca-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-2",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Leveraging Results from External Organizations",
    "description": "Leverage the results of control assessments performed by [external organization(s)] on [system] when the assessment meets [requirements].",
    "priority": "P3",
    "relatedControls": [
      "sa-4"
    ]
  },
  {
    "id": "ca-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Information Exchange",
    "description": "Approve and manage the exchange of information between the system and other systems using [choose: interconnection security agreements, information exchange security agreements, memoranda of understanding or agreement, service level agreements, user agreements, non-disclosure agreements, {{ insert: param, ca-03_odp.02 }} ]; Document, as part of each exchange agreement, the interface characteristics, security and privacy requirements, controls, and responsibilities for each system, and the impact level of the information communicated; and Review and update the agreements [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "c3a76872-e160-4267-99e8-6952de967d04"
    ],
    "relatedControls": [
      "ac-4",
      "ac-20",
      "au-16",
      "ca-6",
      "ia-3",
      "ir-4",
      "pl-2",
      "pt-7",
      "ra-3",
      "sa-9",
      "sc-7",
      "si-12"
    ]
  },
  {
    "id": "ca-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Unclassified National Security System Connections",
    "description": "Unclassified National Security System Connections",
    "priority": "P3"
  },
  {
    "id": "ca-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Classified National Security System Connections",
    "description": "Classified National Security System Connections",
    "priority": "P3"
  },
  {
    "id": "ca-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Unclassified Non-national Security System Connections",
    "description": "Unclassified Non-national Security System Connections",
    "priority": "P3"
  },
  {
    "id": "ca-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Connections to Public Networks",
    "description": "Connections to Public Networks",
    "priority": "P3"
  },
  {
    "id": "ca-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Restrictions on External System Connections",
    "description": "Restrictions on External System Connections",
    "priority": "P3"
  },
  {
    "id": "ca-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Transfer Authorizations",
    "description": "Verify that individuals or systems transferring data between interconnecting systems have the requisite authorizations (i.e., write permissions or privileges) prior to accepting such data.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-4"
    ]
  },
  {
    "id": "ca-3.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-3",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Transitive Information Exchanges",
    "description": "Identify transitive (downstream) information exchanges with other systems through the systems identified in [CA-3a](#ca-3_smt.a) ; and Take measures to ensure that transitive (downstream) information exchanges cease when the controls on identified transitive (downstream) systems cannot be verified or validated.",
    "priority": "P3",
    "relatedControls": [
      "sc-7"
    ]
  },
  {
    "id": "ca-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Security Certification",
    "description": "Security Certification",
    "priority": "P3"
  },
  {
    "id": "ca-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Plan of Action and Milestones",
    "description": "Develop a plan of action and milestones for the system to document the planned remediation actions of the organization to correct weaknesses or deficiencies noted during the assessment of the controls and to reduce or eliminate known vulnerabilities in the system; and Update existing plan of action and milestones [frequency] based on the findings from control assessments, independent audits or reviews, and continuous monitoring activities.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8"
    ],
    "relatedControls": [
      "ca-2",
      "ca-7",
      "pm-4",
      "pm-9",
      "ra-7",
      "si-2",
      "si-12"
    ]
  },
  {
    "id": "ca-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-5",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Automation Support for Accuracy and Currency",
    "description": "Ensure the accuracy, currency, and availability of the plan of action and milestones for the system using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "ca-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Authorization",
    "description": "Assign a senior official as the authorizing official for the system; Assign a senior official as the authorizing official for common controls available for inheritance by organizational systems; Ensure that the authorizing official for the system, before commencing operations: Accepts the use of common controls inherited by the system; and Authorizes the system to operate; Ensure that the authorizing official for common controls authorizes the use of those controls for inheritance by organizational systems; Update the authorizations [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb"
    ],
    "relatedControls": [
      "ca-2",
      "ca-3",
      "ca-7",
      "pm-9",
      "pm-10",
      "ra-3",
      "sa-10",
      "si-12"
    ]
  },
  {
    "id": "ca-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-6",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Joint Authorization — Intra-organization",
    "description": "Employ a joint authorization process for the system that includes multiple authorizing officials from the same organization conducting the authorization.",
    "priority": "P3",
    "relatedControls": [
      "ac-6"
    ]
  },
  {
    "id": "ca-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-6",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Joint Authorization — Inter-organization",
    "description": "Employ a joint authorization process for the system that includes multiple authorizing officials with at least one authorizing official from an organization external to the organization conducting the authorization.",
    "priority": "P3",
    "relatedControls": [
      "ac-6"
    ]
  },
  {
    "id": "ca-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Continuous Monitoring",
    "description": "Develop a system-level continuous monitoring strategy and implement continuous monitoring in accordance with the organization-level continuous monitoring strategy that includes: Establishing the following system-level metrics to be monitored: [system-level metrics]; Establishing [frequencies] for monitoring and [frequencies] for assessment of control effectiveness; Ongoing control assessments in accordance with the continuous monitoring strategy; Ongoing monitoring of system and organization-defined metrics in accordance with the continuous monitoring strategy; Correlation and analysis of information generated by control assessments and monitoring; Response actions to address results of the analysis of control assessment and monitoring information; and Reporting the security and privacy status of the system to [organization-defined personnel or roles] [organization-defined frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "122177fa-c4ed-485d-8345-3082c0fb9a06",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb",
      "bbac9fc2-df5b-4f2d-bf99-90d0ade45349",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "ac-2",
      "ac-6",
      "ac-17",
      "at-4",
      "au-6",
      "au-13",
      "ca-2",
      "ca-5",
      "ca-6",
      "cm-3",
      "cm-4",
      "cm-6",
      "cm-11",
      "ia-5",
      "ir-5",
      "ma-2",
      "ma-3",
      "ma-4",
      "pe-3",
      "pe-6",
      "pe-14",
      "pe-16",
      "pe-20",
      "pl-2",
      "pm-4",
      "pm-6",
      "pm-9",
      "pm-10",
      "pm-12",
      "pm-14",
      "pm-23",
      "pm-28",
      "pm-31",
      "ps-7",
      "pt-7",
      "ra-3",
      "ra-5",
      "ra-7",
      "ra-10",
      "sa-8",
      "sa-9",
      "sa-11",
      "sc-5",
      "sc-7",
      "sc-18",
      "sc-38",
      "sc-43",
      "si-3",
      "si-4",
      "si-12",
      "sr-6"
    ]
  },
  {
    "id": "ca-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Independent Assessment",
    "description": "Employ independent assessors or assessment teams to monitor the controls in the system on an ongoing basis.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ca-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Types of Assessments",
    "description": "Types of Assessments",
    "priority": "P3"
  },
  {
    "id": "ca-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Trend Analyses",
    "description": "Employ trend analyses to determine if control implementations, the frequency of continuous monitoring activities, and the types of activities used in the continuous monitoring process need to be modified based on empirical data.",
    "priority": "P3"
  },
  {
    "id": "ca-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Risk Monitoring",
    "description": "Ensure risk monitoring is an integral part of the continuous monitoring strategy that includes the following: Effectiveness monitoring; Compliance monitoring; and Change monitoring.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ]
  },
  {
    "id": "ca-7.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Consistency Analysis",
    "description": "Employ the following actions to validate that policies are established and implemented controls are operating in a consistent manner: [organization-defined actions].",
    "priority": "P3"
  },
  {
    "id": "ca-7.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-7",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Automation Support for Monitoring",
    "description": "Ensure the accuracy, currency, and availability of monitoring results for the system using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "ca-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Penetration Testing",
    "description": "Conduct penetration testing [frequency] on [system(s) or system components].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ra-5",
      "ra-10",
      "sa-11",
      "sr-5",
      "sr-6"
    ]
  },
  {
    "id": "ca-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-8",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Independent Penetration Testing Agent or Team",
    "description": "Employ an independent penetration testing agent or team to perform penetration testing on the system or system components.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ca-2"
    ]
  },
  {
    "id": "ca-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-8",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Red Team Exercises",
    "description": "Employ the following red-team exercises to simulate attempts by adversaries to compromise organizational systems in accordance with applicable rules of engagement: [red team exercises].",
    "priority": "P3"
  },
  {
    "id": "ca-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-8",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Facility Penetration Testing",
    "description": "Employ a penetration testing process that includes [frequency] [choose: announced, unannounced] attempts to bypass or circumvent controls associated with physical access points to the facility.",
    "priority": "P3",
    "relatedControls": [
      "ca-2",
      "pe-3"
    ]
  },
  {
    "id": "ca-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Internal System Connections",
    "description": "Authorize internal connections of [system components] to the system; Document, for each internal connection, the interface characteristics, security and privacy requirements, and the nature of the information communicated; Terminate internal system connections after [conditions] ; and Review [frequency] the continued need for each internal connection.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "0f66be67-85e7-4ca6-bd19-39453e9f4394",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-18",
      "ac-19",
      "cm-2",
      "ia-3",
      "sc-7",
      "si-12"
    ]
  },
  {
    "id": "ca-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ca-9",
    "family": "Assessment, Authorization, and Monitoring",
    "title": "Compliance Checks",
    "description": "Perform security and privacy compliance checks on constituent system components prior to the establishment of the internal connection.",
    "priority": "P3",
    "relatedControls": [
      "cm-6"
    ]
  },
  {
    "id": "cm-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] configuration management policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the configuration management policy and the associated configuration management controls; Designate an [official] to manage the development, documentation, and dissemination of the configuration management policy and procedures; and Review and update the current configuration management: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "cm-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Software Usage Restrictions",
    "description": "Use software and associated documentation in accordance with contract agreements and copyright laws; Track the use of software and associated documentation protected by quantity licenses to control copying and distribution; and Control and document the use of peer-to-peer file sharing technology to ensure that this capability is not used for the unauthorized distribution, display, performance, or reproduction of copyrighted work.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-17",
      "au-6",
      "cm-7",
      "cm-8",
      "pm-30",
      "sc-7"
    ]
  },
  {
    "id": "cm-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-10",
    "family": "Configuration Management",
    "title": "Open-source Software",
    "description": "Establish the following restrictions on the use of open-source software: [restrictions].",
    "priority": "P3",
    "relatedControls": [
      "si-7"
    ]
  },
  {
    "id": "cm-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "User-installed Software",
    "description": "Establish [policies] governing the installation of software by users; Enforce software installation policies through the following methods: [methods] ; and Monitor policy compliance [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-3",
      "au-6",
      "cm-2",
      "cm-3",
      "cm-5",
      "cm-6",
      "cm-7",
      "cm-8",
      "pl-4",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "cm-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-11",
    "family": "Configuration Management",
    "title": "Alerts for Unauthorized Installations",
    "description": "Alerts for Unauthorized Installations",
    "priority": "P3"
  },
  {
    "id": "cm-11.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-11",
    "family": "Configuration Management",
    "title": "Software Installation with Privileged Status",
    "description": "Allow user installation of software only with explicit privileged status.",
    "priority": "P3",
    "relatedControls": [
      "ac-5",
      "ac-6"
    ]
  },
  {
    "id": "cm-11.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-11",
    "family": "Configuration Management",
    "title": "Automated Enforcement and Monitoring",
    "description": "Enforce and monitor compliance with software installation policies using [organization-defined automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "cm-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Information Location",
    "description": "Identify and document the location of [information] and the specific system components on which the information is processed and stored; Identify and document the users who have access to the system and system components where the information is processed and stored; and Document changes to the location (i.e., system or system components) where the information is processed and stored.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-4",
      "ac-6",
      "ac-23",
      "cm-8",
      "pm-5",
      "ra-2",
      "sa-4",
      "sa-8",
      "sa-17",
      "sc-4",
      "sc-16",
      "sc-28",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "cm-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-12",
    "family": "Configuration Management",
    "title": "Automated Tools to Support Information Location",
    "description": "Use automated tools to identify [information by information type] on [system components] to ensure controls are in place to protect organizational information and individual privacy.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cm-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Data Action Mapping",
    "description": "Develop and document a map of system data actions.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "cm-4",
      "cm-12",
      "pm-5",
      "pm-27",
      "pt-2",
      "pt-3",
      "ra-3",
      "ra-8"
    ]
  },
  {
    "id": "cm-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Signed Components",
    "description": "Prevent the installation of [organization-defined software and firmware components] without verification that the component has been digitally signed using a certificate that is recognized and approved by the organization.",
    "priority": "P3",
    "references": [
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "cm-7",
      "sc-12",
      "sc-13",
      "si-7"
    ]
  },
  {
    "id": "cm-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Baseline Configuration",
    "description": "Develop, document, and maintain under configuration control, a current baseline configuration of the system; and Review and update the baseline configuration of the system: [frequency]; When required due to [circumstances] ; and When system components are installed or upgraded.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "0f66be67-85e7-4ca6-bd19-39453e9f4394",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88"
    ],
    "relatedControls": [
      "ac-19",
      "au-6",
      "ca-9",
      "cm-1",
      "cm-3",
      "cm-5",
      "cm-6",
      "cm-8",
      "cm-9",
      "cp-9",
      "cp-10",
      "cp-12",
      "ma-2",
      "pl-8",
      "pm-5",
      "sa-8",
      "sa-10",
      "sa-15",
      "sc-18"
    ]
  },
  {
    "id": "cm-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Reviews and Updates",
    "description": "Reviews and Updates",
    "priority": "P3"
  },
  {
    "id": "cm-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Automation Support for Accuracy and Currency",
    "description": "Maintain the currency, completeness, accuracy, and availability of the baseline configuration of the system using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-7",
      "ia-3",
      "ra-5"
    ]
  },
  {
    "id": "cm-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Retention of Previous Configurations",
    "description": "Retain [number] of previous versions of baseline configurations of the system to support rollback.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cm-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Unauthorized Software",
    "description": "Unauthorized Software",
    "priority": "P3"
  },
  {
    "id": "cm-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Authorized Software",
    "description": "Authorized Software",
    "priority": "P3"
  },
  {
    "id": "cm-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Development and Test Environments",
    "description": "Maintain a baseline configuration for system development and test environments that is managed separately from the operational baseline configuration.",
    "priority": "P3",
    "relatedControls": [
      "cm-4",
      "sc-3",
      "sc-7"
    ]
  },
  {
    "id": "cm-2.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-2",
    "family": "Configuration Management",
    "title": "Configure Systems and Components for High-risk Areas",
    "description": "Issue [systems or system components] with [configurations] to individuals traveling to locations that the organization deems to be of significant risk; and Apply the following controls to the systems or components when the individuals return from travel: [controls].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "mp-4",
      "mp-5"
    ]
  },
  {
    "id": "cm-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Configuration Change Control",
    "description": "Determine and document the types of changes to the system that are configuration-controlled; Review proposed configuration-controlled changes to the system and approve or disapprove such changes with explicit consideration for security and privacy impact analyses; Document configuration change decisions associated with the system; Implement approved configuration-controlled changes to the system; Retain records of configuration-controlled changes to the system for [time period]; Monitor and review activities associated with configuration-controlled changes to the system; and Coordinate and provide oversight for configuration change control activities through [configuration change control element] that convenes [choose: {{ insert: param, cm-03_odp.04 }} , when {{ insert: param, cm-03_odp.05 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "0f66be67-85e7-4ca6-bd19-39453e9f4394",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "ca-7",
      "cm-2",
      "cm-4",
      "cm-5",
      "cm-6",
      "cm-9",
      "cm-11",
      "ia-3",
      "ma-2",
      "pe-16",
      "pt-6",
      "ra-8",
      "sa-8",
      "sa-10",
      "sc-28",
      "sc-34",
      "sc-37",
      "si-2",
      "si-3",
      "si-4",
      "si-7",
      "si-10",
      "sr-11"
    ]
  },
  {
    "id": "cm-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Automated Documentation, Notification, and Prohibition of Changes",
    "description": "Use [automated mechanisms] to: Document proposed changes to the system; Notify [approval authorities] of proposed changes to the system and request change approval; Highlight proposed changes to the system that have not been approved or disapproved within [time period]; Prohibit changes to the system until designated approvals are received; Document all changes to the system; and Notify [personnel] when approved changes to the system are completed.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cm-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Testing, Validation, and Documentation of Changes",
    "description": "Test, validate, and document changes to the system before finalizing the implementation of the changes.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cm-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Automated Change Implementation",
    "description": "Implement changes to the current system baseline and deploy the updated baseline across the installed base using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "cm-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Security and Privacy Representatives",
    "description": "Require [organization-defined security and privacy representatives] to be members of the [configuration change control element].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cm-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Automated Security Response",
    "description": "Implement the following security responses automatically if baseline configurations are changed in an unauthorized manner: [security responses].",
    "priority": "P3"
  },
  {
    "id": "cm-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Cryptography Management",
    "description": "Ensure that cryptographic mechanisms used to provide the following controls are under configuration management: [controls].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "sc-12"
    ]
  },
  {
    "id": "cm-3.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Review System Changes",
    "description": "Review changes to the system [frequency] or when [circumstances] to determine whether unauthorized changes have occurred.",
    "priority": "P3",
    "relatedControls": [
      "au-6",
      "au-7",
      "cm-3"
    ]
  },
  {
    "id": "cm-3.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-3",
    "family": "Configuration Management",
    "title": "Prevent or Restrict Configuration Changes",
    "description": "Prevent or restrict changes to the configuration of the system under the following circumstances: [circumstances].",
    "priority": "P3"
  },
  {
    "id": "cm-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Impact Analyses",
    "description": "Analyze changes to the system to determine potential security and privacy impacts prior to change implementation.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88"
    ],
    "relatedControls": [
      "ca-7",
      "cm-3",
      "cm-8",
      "cm-9",
      "ma-2",
      "ra-3",
      "ra-5",
      "ra-8",
      "sa-5",
      "sa-8",
      "sa-10",
      "si-2"
    ]
  },
  {
    "id": "cm-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-4",
    "family": "Configuration Management",
    "title": "Separate Test Environments",
    "description": "Analyze changes to the system in a separate test environment before implementation in an operational environment, looking for security and privacy impacts due to flaws, weaknesses, incompatibility, or intentional malice.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "sa-11",
      "sc-7"
    ]
  },
  {
    "id": "cm-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-4",
    "family": "Configuration Management",
    "title": "Verification of Controls",
    "description": "After system changes, verify that the impacted controls are implemented correctly, operating as intended, and producing the desired outcome with regard to meeting the security and privacy requirements for the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sa-11",
      "sc-3",
      "si-6"
    ]
  },
  {
    "id": "cm-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Access Restrictions for Change",
    "description": "Define, document, approve, and enforce physical and logical access restrictions associated with changes to the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1"
    ],
    "relatedControls": [
      "ac-3",
      "ac-5",
      "ac-6",
      "cm-9",
      "pe-3",
      "sc-28",
      "sc-34",
      "sc-37",
      "si-2",
      "si-10"
    ]
  },
  {
    "id": "cm-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Automated Access Enforcement and Audit Records",
    "description": "Enforce access restrictions using [automated mechanisms] ; and Automatically generate audit records of the enforcement actions.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-2",
      "au-6",
      "au-7",
      "au-12",
      "cm-6",
      "cm-11",
      "si-12"
    ]
  },
  {
    "id": "cm-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Review System Changes",
    "description": "Review System Changes",
    "priority": "P3"
  },
  {
    "id": "cm-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Signed Components",
    "description": "Signed Components",
    "priority": "P3"
  },
  {
    "id": "cm-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Dual Authorization",
    "description": "Enforce dual authorization for implementing changes to [organization-defined system components and system-level information].",
    "priority": "P3",
    "relatedControls": [
      "ac-2",
      "ac-5",
      "cm-3"
    ]
  },
  {
    "id": "cm-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Privilege Limitation for Production and Operation",
    "description": "Limit privileges to change system components and system-related information within a production or operational environment; and Review and reevaluate privileges [organization-defined frequency].",
    "priority": "P3",
    "relatedControls": [
      "ac-2"
    ]
  },
  {
    "id": "cm-5.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Limit Library Privileges",
    "description": "Limit privileges to change software resident within software libraries.",
    "priority": "P3",
    "relatedControls": [
      "ac-2"
    ]
  },
  {
    "id": "cm-5.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-5",
    "family": "Configuration Management",
    "title": "Automatic Implementation of Security Safeguards",
    "description": "Automatic Implementation of Security Safeguards",
    "priority": "P3"
  },
  {
    "id": "cm-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Configuration Settings",
    "description": "Establish and document configuration settings for components employed within the system that reflect the most restrictive mode consistent with operational requirements using [common secure configurations]; Implement the configuration settings; Identify, document, and approve any deviations from established configuration settings for [system components] based on [operational requirements] ; and Monitor and control changes to the configuration settings in accordance with organizational policies and procedures.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4895b4cd-34c5-4667-bf8a-27d443c12047",
      "8016d2ed-d30f-4416-9c45-0f42c7aa3232",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88",
      "98498928-3ca3-44b3-8b1e-f48685373087",
      "d744d9a3-73eb-4085-b9ff-79e82e9e2d6e",
      "aa66e14f-e7cb-4a37-99d2-07578dfd4608"
    ],
    "relatedControls": [
      "ac-3",
      "ac-19",
      "au-2",
      "au-6",
      "ca-9",
      "cm-2",
      "cm-3",
      "cm-5",
      "cm-7",
      "cm-11",
      "cp-7",
      "cp-9",
      "cp-10",
      "ia-3",
      "ia-5",
      "pl-8",
      "pl-9",
      "ra-5",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-9",
      "sc-18",
      "sc-28",
      "sc-43",
      "si-2",
      "si-4",
      "si-6"
    ]
  },
  {
    "id": "cm-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-6",
    "family": "Configuration Management",
    "title": "Automated Management, Application, and Verification",
    "description": "Manage, apply, and verify configuration settings for [system components] using [organization-defined automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ca-7"
    ]
  },
  {
    "id": "cm-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-6",
    "family": "Configuration Management",
    "title": "Respond to Unauthorized Changes",
    "description": "Take the following actions in response to unauthorized changes to [configuration settings]: [actions].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ir-4",
      "ir-6",
      "si-7"
    ]
  },
  {
    "id": "cm-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-6",
    "family": "Configuration Management",
    "title": "Unauthorized Change Detection",
    "description": "Unauthorized Change Detection",
    "priority": "P3"
  },
  {
    "id": "cm-6.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-6",
    "family": "Configuration Management",
    "title": "Conformance Demonstration",
    "description": "Conformance Demonstration",
    "priority": "P3"
  },
  {
    "id": "cm-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Least Functionality",
    "description": "Configure the system to provide only [mission-essential capabilities] ; and Prohibit or restrict the use of the following functions, ports, protocols, software, and/or services: [organization-defined prohibited or restricted functions, system ports, protocols, software, and/or services].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "38f39739-1ebd-43b1-8b8c-00f591d89ebd"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "cm-2",
      "cm-5",
      "cm-6",
      "cm-11",
      "ra-5",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-9",
      "sa-15",
      "sc-2",
      "sc-3",
      "sc-7",
      "sc-37",
      "si-4"
    ]
  },
  {
    "id": "cm-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Periodic Review",
    "description": "Review the system [frequency] to identify unnecessary and/or nonsecure functions, ports, protocols, software, and services; and Disable or remove [organization-defined functions, ports, protocols, software, and services within the system deemed to be unnecessary and/or nonsecure].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-18"
    ]
  },
  {
    "id": "cm-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Prevent Program Execution",
    "description": "Prevent program execution in accordance with [choose: {{ insert: param, cm-07.02_odp.02 }} , rules authorizing the terms and conditions of software program usage].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-8",
      "pl-4",
      "pl-9",
      "pm-5",
      "ps-6"
    ]
  },
  {
    "id": "cm-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Registration Compliance",
    "description": "Ensure compliance with [registration requirements].",
    "priority": "P3"
  },
  {
    "id": "cm-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Unauthorized Software — Deny-by-exception",
    "description": "Identify [software programs]; Employ an allow-all, deny-by-exception policy to prohibit the execution of unauthorized software programs on the system; and Review and update the list of unauthorized software programs [frequency].",
    "priority": "P3",
    "relatedControls": [
      "cm-6",
      "cm-8",
      "cm-10",
      "pl-9",
      "pm-5"
    ]
  },
  {
    "id": "cm-7.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Authorized Software — Allow-by-exception",
    "description": "Identify [software programs]; Employ a deny-all, permit-by-exception policy to allow the execution of authorized software programs on the system; and Review and update the list of authorized software programs [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-2",
      "cm-6",
      "cm-8",
      "cm-10",
      "pl-9",
      "pm-5",
      "sa-10",
      "sc-34",
      "si-7"
    ]
  },
  {
    "id": "cm-7.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Confined Environments with Limited Privileges",
    "description": "Require that the following user-installed software execute in a confined physical or virtual machine environment with limited privileges: [user-installed software].",
    "priority": "P3",
    "relatedControls": [
      "cm-11",
      "sc-44"
    ]
  },
  {
    "id": "cm-7.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Code Execution in Protected Environments",
    "description": "Allow execution of binary or machine-executable code only in confined physical or virtual machine environments and with the explicit approval of [personnel or roles] when such code is: Obtained from sources with limited or no warranty; and/or Without the provision of source code.",
    "priority": "P3",
    "relatedControls": [
      "cm-10",
      "sc-44"
    ]
  },
  {
    "id": "cm-7.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Binary or Machine Executable Code",
    "description": "Prohibit the use of binary or machine-executable code from sources with limited or no warranty or without the provision of source code; and Allow exceptions only for compelling mission or operational requirements and with the approval of the authorizing official.",
    "priority": "P3",
    "relatedControls": [
      "sa-5",
      "sa-22"
    ]
  },
  {
    "id": "cm-7.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-7",
    "family": "Configuration Management",
    "title": "Prohibiting The Use of Unauthorized Hardware",
    "description": "Identify [hardware components]; Prohibit the use or connection of unauthorized hardware components; Review and update the list of authorized hardware components [frequency].",
    "priority": "P3"
  },
  {
    "id": "cm-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "System Component Inventory",
    "description": "Develop and document an inventory of system components that: Accurately reflects the system; Includes all components within the system; Does not include duplicate accounting of components or components assigned to any other system; Is at the level of granularity deemed necessary for tracking and reporting; and Includes the following information to achieve system component accountability: [information] ; and Review and update the system component inventory [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88",
      "70402863-5078-43af-9a6c-e11b0f3ec370",
      "996241f8-f692-42d5-91f1-ce8b752e39e6"
    ],
    "relatedControls": [
      "cm-2",
      "cm-7",
      "cm-9",
      "cm-10",
      "cm-11",
      "cm-13",
      "cp-2",
      "cp-9",
      "ma-2",
      "ma-6",
      "pe-20",
      "pl-9",
      "pm-5",
      "sa-4",
      "sa-5",
      "si-2",
      "sr-4"
    ]
  },
  {
    "id": "cm-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Updates During Installation and Removal",
    "description": "Update the inventory of system components as part of component installations, removals, and system updates.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "pm-16"
    ]
  },
  {
    "id": "cm-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Automated Maintenance",
    "description": "Maintain the currency, completeness, accuracy, and availability of the inventory of system components using [organization-defined automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cm-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Automated Unauthorized Component Detection",
    "description": "Detect the presence of unauthorized hardware, software, and firmware components within the system using [organization-defined automated mechanisms] [frequency] ; and Take the following actions when unauthorized components are detected: [choose: disable network access by unauthorized components, isolate unauthorized components, notify {{ insert: param, cm-08.03_odp.06 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-19",
      "ca-7",
      "ra-5",
      "sc-3",
      "sc-39",
      "sc-44",
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "cm-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Accountability Information",
    "description": "Include in the system component inventory information, a means for identifying by [choose: name, position, role] , individuals responsible and accountable for administering those components.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "cm-8.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "No Duplicate Accounting of Components",
    "description": "No Duplicate Accounting of Components",
    "priority": "P3"
  },
  {
    "id": "cm-8.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Assessed Configurations and Approved Deviations",
    "description": "Include assessed component configurations and any approved deviations to current deployed configurations in the system component inventory.",
    "priority": "P3"
  },
  {
    "id": "cm-8.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Centralized Repository",
    "description": "Provide a centralized repository for the inventory of system components.",
    "priority": "P3"
  },
  {
    "id": "cm-8.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Automated Location Tracking",
    "description": "Support the tracking of system components by geographic location using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "cm-8.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-8",
    "family": "Configuration Management",
    "title": "Assignment of Components to Systems",
    "description": "Assign system components to a system; and Receive an acknowledgement from [personnel or roles] of this assignment.",
    "priority": "P3"
  },
  {
    "id": "cm-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Configuration Management",
    "title": "Configuration Management Plan",
    "description": "Develop, document, and implement a configuration management plan for the system that: Addresses roles, responsibilities, and configuration management processes and procedures; Establishes a process for identifying configuration items throughout the system development life cycle and for managing the configuration of the configuration items; Defines the configuration items for the system and places the configuration items under configuration management; Is reviewed and approved by [personnel or roles] ; and Protects the configuration management plan from unauthorized disclosure and modification.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88"
    ],
    "relatedControls": [
      "cm-2",
      "cm-3",
      "cm-4",
      "cm-5",
      "cm-8",
      "pl-2",
      "ra-8",
      "sa-10",
      "si-12"
    ]
  },
  {
    "id": "cm-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cm-9",
    "family": "Configuration Management",
    "title": "Assignment of Responsibility",
    "description": "Assign responsibility for developing the configuration management process to organizational personnel that are not directly involved in system development.",
    "priority": "P3"
  },
  {
    "id": "cp-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] contingency planning policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the contingency planning policy and the associated contingency planning controls; Designate an [official] to manage the development, documentation, and dissemination of the contingency planning policy and procedures; and Review and update the current contingency planning: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "bc39f179-c735-4da2-b7a7-b2b622119755",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "511f6832-23ca-49a3-8c0f-ce493373cab8",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "cp-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "System Recovery and Reconstitution",
    "description": "Provide for the recovery and reconstitution of the system to a known state within [organization-defined time period consistent with recovery time and recovery point objectives] after a disruption, compromise, or failure.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755"
    ],
    "relatedControls": [
      "cp-2",
      "cp-4",
      "cp-6",
      "cp-7",
      "cp-9",
      "ir-4",
      "sa-8",
      "sc-24",
      "si-13"
    ]
  },
  {
    "id": "cp-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Contingency Plan Testing",
    "description": "Contingency Plan Testing",
    "priority": "P3"
  },
  {
    "id": "cp-10.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Transaction Recovery",
    "description": "Implement transaction recovery for systems that are transaction-based.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-10.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Compensating Security Controls",
    "description": "Addressed through tailoring.",
    "priority": "P3"
  },
  {
    "id": "cp-10.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Restore Within Time Period",
    "description": "Provide the capability to restore system components within [restoration time periods] from configuration-controlled and integrity-protected information representing a known, operational state for the components.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cm-2",
      "cm-6"
    ]
  },
  {
    "id": "cp-10.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Failover Capability",
    "description": "Failover Capability",
    "priority": "P3"
  },
  {
    "id": "cp-10.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-10",
    "family": "Contingency Planning",
    "title": "Component Protection",
    "description": "Protect system components used for recovery and reconstitution.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-6",
      "mp-2",
      "mp-4",
      "pe-3",
      "pe-6"
    ]
  },
  {
    "id": "cp-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Alternate Communications Protocols",
    "description": "Provide the capability to employ [alternative communications protocols] in support of maintaining continuity of operations.",
    "priority": "P3",
    "relatedControls": [
      "cp-2",
      "cp-8",
      "cp-13"
    ]
  },
  {
    "id": "cp-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Safe Mode",
    "description": "When [conditions] are detected, enter a safe mode of operation with [restrictions].",
    "priority": "P3",
    "relatedControls": [
      "cm-2",
      "sa-8",
      "sc-24",
      "si-13",
      "si-17"
    ]
  },
  {
    "id": "cp-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Alternative Security Mechanisms",
    "description": "Employ [alternative or supplemental security mechanisms] for satisfying [security functions] when the primary means of implementing the security function is unavailable or compromised.",
    "priority": "P3",
    "relatedControls": [
      "cp-2",
      "cp-11",
      "si-13"
    ]
  },
  {
    "id": "cp-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Contingency Plan",
    "description": "Develop a contingency plan for the system that: Identifies essential mission and business functions and associated contingency requirements; Provides recovery objectives, restoration priorities, and metrics; Addresses contingency roles, responsibilities, assigned individuals with contact information; Addresses maintaining essential mission and business functions despite a system disruption, compromise, or failure; Addresses eventual, full system restoration without deterioration of the controls originally planned and implemented; Addresses the sharing of contingency information; and Is reviewed and approved by [organization-defined personnel or roles]; Distribute copies of the contingency plan to [organization-defined key contingency personnel (identified by name and/or by role) and organizational elements]; Coordinate contingency planning activities with incident handling activities; Review the contingency plan for the system [frequency]; Update the contingency plan to address changes to the organization, system, or environment of operation and problems encountered during contingency plan implementation, execution, or testing; Communicate contingency plan changes to [organization-defined key contingency personnel (identified by name and/or by role) and organizational elements]; Incorporate lessons learned from contingency plan testing, training, or actual contingency activities into contingency testing and training; and Protect the contingency plan from unauthorized disclosure and modification.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755",
      "d4296805-2dca-4c63-a95f-eeccaa826aec"
    ],
    "relatedControls": [
      "cp-3",
      "cp-4",
      "cp-6",
      "cp-7",
      "cp-8",
      "cp-9",
      "cp-10",
      "cp-11",
      "cp-13",
      "ir-4",
      "ir-6",
      "ir-8",
      "ir-9",
      "ma-6",
      "mp-2",
      "mp-4",
      "mp-5",
      "pl-2",
      "pm-8",
      "pm-11",
      "sa-15",
      "sa-20",
      "sc-7",
      "sc-23",
      "si-12"
    ]
  },
  {
    "id": "cp-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Coordinate with Related Plans",
    "description": "Coordinate contingency plan development with organizational elements responsible for related plans.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Capacity Planning",
    "description": "Conduct capacity planning so that necessary capacity for information processing, telecommunications, and environmental support exists during contingency operations.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "pe-11",
      "pe-12",
      "pe-13",
      "pe-14",
      "pe-18",
      "sc-5"
    ]
  },
  {
    "id": "cp-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Resume Mission and Business Functions",
    "description": "Plan for the resumption of [choose: all, essential] mission and business functions within [time period] of contingency plan activation.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Resume All Mission and Business Functions",
    "description": "Resume All Mission and Business Functions",
    "priority": "P3"
  },
  {
    "id": "cp-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Continue Mission and Business Functions",
    "description": "Plan for the continuance of [choose: all, essential] mission and business functions with minimal or no loss of operational continuity and sustains that continuity until full system restoration at primary processing and/or storage sites.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cp-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Alternate Processing and Storage Sites",
    "description": "Plan for the transfer of [choose: all, essential] mission and business functions to alternate processing and/or storage sites with minimal or no loss of operational continuity and sustain that continuity through system restoration to primary processing and/or storage sites.",
    "priority": "P3"
  },
  {
    "id": "cp-2.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Coordinate with External Service Providers",
    "description": "Coordinate the contingency plan with the contingency plans of external service providers to ensure that contingency requirements can be satisfied.",
    "priority": "P3",
    "relatedControls": [
      "sa-9"
    ]
  },
  {
    "id": "cp-2.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-2",
    "family": "Contingency Planning",
    "title": "Identify Critical Assets",
    "description": "Identify critical system assets supporting [choose: all, essential] mission and business functions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-8",
      "ra-9"
    ]
  },
  {
    "id": "cp-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Contingency Training",
    "description": "Provide contingency training to system users consistent with assigned roles and responsibilities: Within [time period] of assuming a contingency role or responsibility; When required by system changes; and [frequency] thereafter; and Review and update contingency training content [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "511f6832-23ca-49a3-8c0f-ce493373cab8"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "at-4",
      "cp-2",
      "cp-4",
      "cp-8",
      "ir-2",
      "ir-4",
      "ir-9"
    ]
  },
  {
    "id": "cp-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-3",
    "family": "Contingency Planning",
    "title": "Simulated Events",
    "description": "Incorporate simulated events into contingency training to facilitate effective response by personnel in crisis situations.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cp-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-3",
    "family": "Contingency Planning",
    "title": "Mechanisms Used in Training Environments",
    "description": "Employ mechanisms used in operations to provide a more thorough and realistic contingency training environment.",
    "priority": "P3"
  },
  {
    "id": "cp-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Contingency Plan Testing",
    "description": "Test the contingency plan for the system [frequency] using the following tests to determine the effectiveness of the plan and the readiness to execute the plan: [organization-defined tests]. Review the contingency plan test results; and Initiate corrective actions, if needed.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "bc39f179-c735-4da2-b7a7-b2b622119755",
      "53be2fcf-cfd1-4bcb-896b-9a3b65c22098",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "at-3",
      "cp-2",
      "cp-3",
      "cp-8",
      "cp-9",
      "ir-3",
      "ir-4",
      "pl-2",
      "pm-14",
      "sr-2"
    ]
  },
  {
    "id": "cp-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-4",
    "family": "Contingency Planning",
    "title": "Coordinate with Related Plans",
    "description": "Coordinate contingency plan testing with organizational elements responsible for related plans.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ir-8",
      "pm-8"
    ]
  },
  {
    "id": "cp-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-4",
    "family": "Contingency Planning",
    "title": "Alternate Processing Site",
    "description": "Test the contingency plan at the alternate processing site: To familiarize contingency personnel with the facility and available resources; and To evaluate the capabilities of the alternate processing site to support contingency operations.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-7"
    ]
  },
  {
    "id": "cp-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-4",
    "family": "Contingency Planning",
    "title": "Automated Testing",
    "description": "Test the contingency plan using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "cp-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-4",
    "family": "Contingency Planning",
    "title": "Full Recovery and Reconstitution",
    "description": "Include a full recovery and reconstitution of the system to a known state as part of contingency plan testing.",
    "priority": "P3",
    "relatedControls": [
      "cp-10",
      "sc-24"
    ]
  },
  {
    "id": "cp-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-4",
    "family": "Contingency Planning",
    "title": "Self-challenge",
    "description": "Employ [mechanisms] to [system or system component] to disrupt and adversely affect the system or system component.",
    "priority": "P3"
  },
  {
    "id": "cp-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Contingency Plan Update",
    "description": "Contingency Plan Update",
    "priority": "P3"
  },
  {
    "id": "cp-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Alternate Storage Site",
    "description": "Establish an alternate storage site, including necessary agreements to permit the storage and retrieval of system backup information; and Ensure that the alternate storage site provides controls equivalent to that of the primary site.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755"
    ],
    "relatedControls": [
      "cp-2",
      "cp-7",
      "cp-8",
      "cp-9",
      "cp-10",
      "mp-4",
      "mp-5",
      "pe-3",
      "sc-36",
      "si-13"
    ]
  },
  {
    "id": "cp-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-6",
    "family": "Contingency Planning",
    "title": "Separation from Primary Site",
    "description": "Identify an alternate storage site that is sufficiently separated from the primary storage site to reduce susceptibility to the same threats.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "cp-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-6",
    "family": "Contingency Planning",
    "title": "Recovery Time and Recovery Point Objectives",
    "description": "Configure the alternate storage site to facilitate recovery operations in accordance with recovery time and recovery point objectives.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cp-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-6",
    "family": "Contingency Planning",
    "title": "Accessibility",
    "description": "Identify potential accessibility problems to the alternate storage site in the event of an area-wide disruption or disaster and outline explicit mitigation actions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "cp-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Alternate Processing Site",
    "description": "Establish an alternate processing site, including necessary agreements to permit the transfer and resumption of [system operations] for essential mission and business functions within [time period] when the primary processing capabilities are unavailable; Make available at the alternate processing site, the equipment and supplies required to transfer and resume operations or put contracts in place to support delivery to the site within the organization-defined time period for transfer and resumption; and Provide controls at the alternate processing site that are equivalent to those at the primary site.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755"
    ],
    "relatedControls": [
      "cp-2",
      "cp-6",
      "cp-8",
      "cp-9",
      "cp-10",
      "ma-6",
      "pe-3",
      "pe-11",
      "pe-12",
      "pe-17",
      "sc-36",
      "si-13"
    ]
  },
  {
    "id": "cp-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Separation from Primary Site",
    "description": "Identify an alternate processing site that is sufficiently separated from the primary processing site to reduce susceptibility to the same threats.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "cp-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Accessibility",
    "description": "Identify potential accessibility problems to alternate processing sites in the event of an area-wide disruption or disaster and outlines explicit mitigation actions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "cp-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Priority of Service",
    "description": "Develop alternate processing site agreements that contain priority-of-service provisions in accordance with availability requirements (including recovery time objectives).",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Preparation for Use",
    "description": "Prepare the alternate processing site so that the site can serve as the operational site supporting essential mission and business functions.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cm-2",
      "cm-6",
      "cp-4"
    ]
  },
  {
    "id": "cp-7.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Equivalent Information Security Safeguards",
    "description": "Equivalent Information Security Safeguards",
    "priority": "P3"
  },
  {
    "id": "cp-7.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-7",
    "family": "Contingency Planning",
    "title": "Inability to Return to Primary Site",
    "description": "Plan and prepare for circumstances that preclude returning to the primary processing site.",
    "priority": "P3"
  },
  {
    "id": "cp-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "Telecommunications Services",
    "description": "Establish alternate telecommunications services, including necessary agreements to permit the resumption of [system operations] for essential mission and business functions within [time period] when the primary telecommunications capabilities are unavailable at either the primary or alternate processing or storage sites.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755"
    ],
    "relatedControls": [
      "cp-2",
      "cp-6",
      "cp-7",
      "cp-11",
      "sc-7"
    ]
  },
  {
    "id": "cp-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-8",
    "family": "Contingency Planning",
    "title": "Priority of Service Provisions",
    "description": "Develop primary and alternate telecommunications service agreements that contain priority-of-service provisions in accordance with availability requirements (including recovery time objectives); and Request Telecommunications Service Priority for all telecommunications services used for national security emergency preparedness if the primary and/or alternate telecommunications services are provided by a common carrier.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-8",
    "family": "Contingency Planning",
    "title": "Single Points of Failure",
    "description": "Obtain alternate telecommunications services to reduce the likelihood of sharing a single point of failure with primary telecommunications services.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "cp-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-8",
    "family": "Contingency Planning",
    "title": "Separation of Primary and Alternate Providers",
    "description": "Obtain alternate telecommunications services from providers that are separated from primary service providers to reduce susceptibility to the same threats.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "cp-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-8",
    "family": "Contingency Planning",
    "title": "Provider Contingency Plan",
    "description": "Require primary and alternate telecommunications service providers to have contingency plans; Review provider contingency plans to ensure that the plans meet organizational contingency requirements; and Obtain evidence of contingency testing and training by providers [organization-defined frequency].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-3",
      "cp-4"
    ]
  },
  {
    "id": "cp-8.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-8",
    "family": "Contingency Planning",
    "title": "Alternate Telecommunication Service Testing",
    "description": "Test alternate telecommunication services [frequency].",
    "priority": "P3",
    "relatedControls": [
      "cp-3"
    ]
  },
  {
    "id": "cp-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Contingency Planning",
    "title": "System Backup",
    "description": "Conduct backups of user-level information contained in [system components] [frequency]; Conduct backups of system-level information contained in the system [frequency]; Conduct backups of system documentation, including security- and privacy-related documentation [frequency] ; and Protect the confidentiality, integrity, and availability of backup information.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "bc39f179-c735-4da2-b7a7-b2b622119755",
      "3653e316-8923-430e-8943-b3b2b2562fc6",
      "2494df28-9049-4196-b233-540e7440993f"
    ],
    "relatedControls": [
      "cp-2",
      "cp-6",
      "cp-10",
      "mp-4",
      "mp-5",
      "sc-8",
      "sc-12",
      "sc-13",
      "si-4",
      "si-13"
    ]
  },
  {
    "id": "cp-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Testing for Reliability and Integrity",
    "description": "Test backup information [organization-defined frequency] to verify media reliability and information integrity.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cp-4"
    ]
  },
  {
    "id": "cp-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Test Restoration Using Sampling",
    "description": "Use a sample of backup information in the restoration of selected system functions as part of contingency plan testing.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-4"
    ]
  },
  {
    "id": "cp-9.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Separate Storage for Critical Information",
    "description": "Store backup copies of [critical system software and other security-related information] in a separate facility or in a fire rated container that is not collocated with the operational system.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cm-2",
      "cm-6",
      "cm-8"
    ]
  },
  {
    "id": "cp-9.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Protection from Unauthorized Modification",
    "description": "Protection from Unauthorized Modification",
    "priority": "P3"
  },
  {
    "id": "cp-9.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Transfer to Alternate Storage Site",
    "description": "Transfer system backup information to the alternate storage site [organization-defined time period and transfer rate consistent with the recovery time and recovery point objectives].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-7",
      "mp-3",
      "mp-4",
      "mp-5"
    ]
  },
  {
    "id": "cp-9.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Redundant Secondary System",
    "description": "Conduct system backup by maintaining a redundant secondary system that is not collocated with the primary system and that can be activated without loss of information or disruption to operations.",
    "priority": "P3",
    "relatedControls": [
      "cp-7"
    ]
  },
  {
    "id": "cp-9.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Dual Authorization for Deletion or Destruction",
    "description": "Enforce dual authorization for the deletion or destruction of [backup information].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-5",
      "mp-2"
    ]
  },
  {
    "id": "cp-9.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "cp-9",
    "family": "Contingency Planning",
    "title": "Cryptographic Protection",
    "description": "Implement cryptographic mechanisms to prevent unauthorized disclosure and modification of [backup information].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-12",
      "sc-13",
      "sc-28"
    ]
  },
  {
    "id": "ia-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] identification and authentication policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the identification and authentication policy and the associated identification and authentication controls; Designate an [official] to manage the development, documentation, and dissemination of the identification and authentication policy and procedures; and Review and update the current identification and authentication: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f",
      "7f473f21-fdbf-4a6c-81a1-0ab95919609d"
    ],
    "relatedControls": [
      "ac-1",
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ia-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Adaptive Authentication",
    "description": "Require individuals accessing the system to employ [supplemental authentication techniques or mechanisms] under specific [circumstances or situations].",
    "priority": "P3",
    "references": [
      "737513fa-6758-403f-831d-5ddab5e23cb3"
    ],
    "relatedControls": [
      "ia-2",
      "ia-8"
    ]
  },
  {
    "id": "ia-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Re-authentication",
    "description": "Require users to re-authenticate when [circumstances or situations].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-3",
      "ac-11",
      "ia-2",
      "ia-3",
      "ia-4",
      "ia-8"
    ]
  },
  {
    "id": "ia-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Identity Proofing",
    "description": "Identity proof users that require accounts for logical access to systems based on appropriate identity assurance level requirements as specified in applicable standards and guidelines; Resolve user identities to a unique individual; and Collect, validate, and verify identity evidence.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "9099ed2c-922a-493d-bcb4-d896192243ff",
      "10963761-58fc-4b20-b3d6-b44a54daba03"
    ],
    "relatedControls": [
      "ac-5",
      "ia-1",
      "ia-2",
      "ia-3",
      "ia-4",
      "ia-5",
      "ia-6",
      "ia-8",
      "ia-13"
    ]
  },
  {
    "id": "ia-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "Supervisor Authorization",
    "description": "Require that the registration process to receive an account for logical access includes supervisor or sponsor authorization.",
    "priority": "P3"
  },
  {
    "id": "ia-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "Identity Evidence",
    "description": "Require evidence of individual identification be presented to the registration authority.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ia-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "Identity Evidence Validation and Verification",
    "description": "Require that the presented identity evidence be validated and verified through [methods of validation and verification].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ia-12.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "In-person Validation and Verification",
    "description": "Require that the validation and verification of identity evidence be conducted in person before a designated registration authority.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ia-12.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "Address Confirmation",
    "description": "Require that a [choose: registration code, notice of proofing] be delivered through an out-of-band channel to verify the users address (physical or digital) of record.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ia-12"
    ]
  },
  {
    "id": "ia-12.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-12",
    "family": "Identification and Authentication",
    "title": "Accept Externally-proofed Identities",
    "description": "Accept externally-proofed identities at [identity assurance level].",
    "priority": "P3",
    "relatedControls": [
      "ia-3",
      "ia-4",
      "ia-5",
      "ia-8"
    ]
  },
  {
    "id": "ia-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Identity Providers and Authorization Servers",
    "description": "Employ identity providers and authorization servers to manage user, device, and non-person entity (NPE) identities, attributes, and access rights supporting authentication and authorization decisions in accordance with [policy] using [mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ia-2",
      "ia-3",
      "ia-8",
      "ia-9",
      "ia-12"
    ]
  },
  {
    "id": "ia-13.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-13",
    "family": "Identification and Authentication",
    "title": "Protection of Cryptographic Keys",
    "description": "Cryptographic keys that protect access tokens are generated, managed, and protected from disclosure and misuse.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ia-13.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-13",
    "family": "Identification and Authentication",
    "title": "Verification of Identity Assertions and Access Tokens",
    "description": "The source and integrity of identity assertions and access tokens are verified before granting access to system and information resources.",
    "priority": "P3"
  },
  {
    "id": "ia-13.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-13",
    "family": "Identification and Authentication",
    "title": "Token Management",
    "description": "In accordance with [ia-13_odp.01], assertions and access tokens are: generated; issued; refreshed; revoked; time-restricted; and audience-restricted.",
    "priority": "P3",
    "references": [
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "ff989cdc-649d-4f45-8f61-9309c9680933",
      "e9d6c5f2-b3aa-4a28-8bea-a0135718d453"
    ]
  },
  {
    "id": "ia-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Identification and Authentication (Organizational Users)",
    "description": "Uniquely identify and authenticate organizational users and associate that unique identification with processes acting on behalf of those users.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d",
      "10963761-58fc-4b20-b3d6-b44a54daba03",
      "d9e036ba-6eec-46a6-9340-b0bf1fea23b4",
      "e8552d48-cf41-40aa-8b06-f45f7fb4706c",
      "15dc76ff-b17a-4eeb-8948-8ea8de3ccc2c",
      "4b38e961-1125-4a5b-aa35-1d6c02846dad",
      "91701292-8bcd-4d2e-a5bd-59ab61e34b3c",
      "4f5f51ac-2b8d-4b90-a3c7-46f56e967617",
      "604774da-9e1d-48eb-9c62-4e959dc80737",
      "7f473f21-fdbf-4a6c-81a1-0ab95919609d",
      "3915a084-b87b-4f02-83d4-c369e746292f"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-4",
      "ac-14",
      "ac-17",
      "ac-18",
      "au-1",
      "au-6",
      "ia-4",
      "ia-5",
      "ia-8",
      "ia-13",
      "ma-4",
      "ma-5",
      "pe-2",
      "pl-4",
      "sa-4",
      "sa-8"
    ]
  },
  {
    "id": "ia-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Multi-factor Authentication to Privileged Accounts",
    "description": "Implement multi-factor authentication for access to privileged accounts.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-5",
      "ac-6"
    ]
  },
  {
    "id": "ia-2.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Single Sign-on",
    "description": "Provide a single sign-on capability for [system accounts and services].",
    "priority": "P3"
  },
  {
    "id": "ia-2.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Remote Access — Separate Device",
    "description": "Remote Access — Separate Device",
    "priority": "P3"
  },
  {
    "id": "ia-2.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Acceptance of PIV Credentials",
    "description": "Accept and electronically verify Personal Identity Verification-compliant credentials.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "ia-2.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Out-of-band Authentication",
    "description": "Implement the following out-of-band authentication mechanisms under [conditions]: [out-of-band authentication].",
    "priority": "P3",
    "relatedControls": [
      "ia-10",
      "ia-11",
      "sc-37"
    ]
  },
  {
    "id": "ia-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Multi-factor Authentication to Non-privileged Accounts",
    "description": "Implement multi-factor authentication for access to non-privileged accounts.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-5"
    ]
  },
  {
    "id": "ia-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Local Access to Privileged Accounts",
    "description": "Local Access to Privileged Accounts",
    "priority": "P3"
  },
  {
    "id": "ia-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Local Access to Non-privileged Accounts",
    "description": "Local Access to Non-privileged Accounts",
    "priority": "P3"
  },
  {
    "id": "ia-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Individual Authentication with Group Authentication",
    "description": "When shared accounts or authenticators are employed, require users to be individually authenticated before granting access to the shared accounts or resources.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ia-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Access to Accounts —separate Device",
    "description": "Implement multi-factor authentication for [choose: local, network, remote] access to [choose: privileged accounts, non-privileged accounts] such that: One of the factors is provided by a device separate from the system gaining access; and The device meets [strength of mechanism requirements].",
    "priority": "P3",
    "relatedControls": [
      "ac-6"
    ]
  },
  {
    "id": "ia-2.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Network Access to Non-privileged Accounts — Separate Device",
    "description": "Network Access to Non-privileged Accounts — Separate Device",
    "priority": "P3"
  },
  {
    "id": "ia-2.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Access to Accounts — Replay Resistant",
    "description": "Implement replay-resistant authentication mechanisms for access to [choose: privileged accounts, non-privileged accounts].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "ia-2.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-2",
    "family": "Identification and Authentication",
    "title": "Network Access to Non-privileged Accounts — Replay Resistant",
    "description": "Network Access to Non-privileged Accounts — Replay Resistant",
    "priority": "P3"
  },
  {
    "id": "ia-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Device Identification and Authentication",
    "description": "Uniquely identify and authenticate [devices and/or types of devices] before establishing a [choose: local, remote, network] connection.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "ac-19",
      "au-6",
      "ca-3",
      "ca-9",
      "ia-4",
      "ia-5",
      "ia-9",
      "ia-11",
      "ia-13",
      "si-4"
    ]
  },
  {
    "id": "ia-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-3",
    "family": "Identification and Authentication",
    "title": "Cryptographic Bidirectional Authentication",
    "description": "Authenticate [devices and/or types of devices] before establishing [choose: local, remote, network] connection using bidirectional authentication that is cryptographically based.",
    "priority": "P3",
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ia-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-3",
    "family": "Identification and Authentication",
    "title": "Cryptographic Bidirectional Network Authentication",
    "description": "Cryptographic Bidirectional Network Authentication",
    "priority": "P3"
  },
  {
    "id": "ia-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-3",
    "family": "Identification and Authentication",
    "title": "Dynamic Address Allocation",
    "description": "Where addresses are allocated dynamically, standardize dynamic address allocation lease information and the lease duration assigned to devices in accordance with [organization-defined lease information and lease duration] ; and Audit lease information when assigned to a device.",
    "priority": "P3",
    "relatedControls": [
      "au-2"
    ]
  },
  {
    "id": "ia-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-3",
    "family": "Identification and Authentication",
    "title": "Device Attestation",
    "description": "Handle device identification and authentication based on attestation by [configuration management process].",
    "priority": "P3",
    "relatedControls": [
      "cm-2",
      "cm-3",
      "cm-6"
    ]
  },
  {
    "id": "ia-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Identifier Management",
    "description": "Manage system identifiers by: Receiving authorization from [personnel or roles] to assign an individual, group, role, service, or device identifier; Selecting an identifier that identifies an individual, group, role, service, or device; Assigning the identifier to the intended individual, group, role, service, or device; and Preventing reuse of identifiers for [time period].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d"
    ],
    "relatedControls": [
      "ac-5",
      "ia-2",
      "ia-3",
      "ia-5",
      "ia-8",
      "ia-9",
      "ia-12",
      "ma-4",
      "pe-2",
      "pe-3",
      "pe-4",
      "pl-4",
      "pm-12",
      "ps-3",
      "ps-4",
      "ps-5",
      "sc-37"
    ]
  },
  {
    "id": "ia-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Prohibit Account Identifiers as Public Identifiers",
    "description": "Prohibit the use of system account identifiers that are the same as public identifiers for individual accounts.",
    "priority": "P3",
    "relatedControls": [
      "at-2",
      "pt-7"
    ]
  },
  {
    "id": "ia-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Supervisor Authorization",
    "description": "Supervisor Authorization",
    "priority": "P3"
  },
  {
    "id": "ia-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Multiple Forms of Certification",
    "description": "Multiple Forms of Certification",
    "priority": "P3"
  },
  {
    "id": "ia-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Identify User Status",
    "description": "Manage individual identifiers by uniquely identifying each individual as [characteristics].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ia-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Dynamic Management",
    "description": "Manage individual identifiers dynamically in accordance with [dynamic identifier policy].",
    "priority": "P3",
    "relatedControls": [
      "ac-16"
    ]
  },
  {
    "id": "ia-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Cross-organization Management",
    "description": "Coordinate with the following external organizations for cross-organization management of identifiers: [external organizations].",
    "priority": "P3",
    "relatedControls": [
      "au-16",
      "ia-2",
      "ia-5"
    ]
  },
  {
    "id": "ia-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "In-person Registration",
    "description": "In-person Registration",
    "priority": "P3"
  },
  {
    "id": "ia-4.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Pairwise Pseudonymous Identifiers",
    "description": "Generate pairwise pseudonymous identifiers.",
    "priority": "P3",
    "relatedControls": [
      "ia-5"
    ]
  },
  {
    "id": "ia-4.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-4",
    "family": "Identification and Authentication",
    "title": "Attribute Maintenance and Protection",
    "description": "Maintain the attributes for each uniquely identified individual, device, or service in [protected central storage].",
    "priority": "P3"
  },
  {
    "id": "ia-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Authenticator Management",
    "description": "Manage system authenticators by: Verifying, as part of the initial authenticator distribution, the identity of the individual, group, role, service, or device receiving the authenticator; Establishing initial authenticator content for any authenticators issued by the organization; Ensuring that authenticators have sufficient strength of mechanism for their intended use; Establishing and implementing administrative procedures for initial authenticator distribution, for lost or compromised or damaged authenticators, and for revoking authenticators; Changing default authenticators prior to first use; Changing or refreshing authenticators [time period by authenticator type] or when [events] occur; Protecting authenticator content from unauthorized disclosure and modification; Requiring individuals to take, and having devices implement, specific controls to protect authenticators; and Changing authenticators for group or role accounts when membership to those accounts changes.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d",
      "15dc76ff-b17a-4eeb-8948-8ea8de3ccc2c",
      "91701292-8bcd-4d2e-a5bd-59ab61e34b3c",
      "4f5f51ac-2b8d-4b90-a3c7-46f56e967617",
      "604774da-9e1d-48eb-9c62-4e959dc80737",
      "81aeb0a3-d0ee-4e44-b842-6bf28d2bd7f5"
    ],
    "relatedControls": [
      "ac-3",
      "ac-6",
      "cm-6",
      "ia-2",
      "ia-4",
      "ia-7",
      "ia-8",
      "ia-9",
      "ma-4",
      "pe-2",
      "pl-4",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ia-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Password-based Authentication",
    "description": "For password-based authentication: Maintain a list of commonly-used, expected, or compromised passwords and update the list [frequency] and when organizational passwords are suspected to have been compromised directly or indirectly; Verify, when users create or update passwords, that the passwords are not found on the list of commonly-used, expected, or compromised passwords in IA-5(1)(a); Transmit passwords only over cryptographically-protected channels; Store passwords using an approved salted key derivation function, preferably using a keyed hash; Require immediate selection of a new password upon account recovery; Allow user selection of long passwords and passphrases, including spaces and all printable characters; Employ automated tools to assist the user in selecting strong password authenticators; and Enforce the following composition and complexity rules: [composition and complexity rules].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ia-6"
    ]
  },
  {
    "id": "ia-5.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Dynamic Credential Binding",
    "description": "Bind identities and authenticators dynamically using the following rules: [binding rules].",
    "priority": "P3",
    "relatedControls": [
      "au-16",
      "ia-5"
    ]
  },
  {
    "id": "ia-5.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Hardware Token-based Authentication",
    "description": "Hardware Token-based Authentication",
    "priority": "P3"
  },
  {
    "id": "ia-5.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Biometric Authentication Performance",
    "description": "For biometric-based authentication, employ mechanisms that satisfy the following biometric quality requirements [biometric quality requirements].",
    "priority": "P3",
    "relatedControls": [
      "ac-7"
    ]
  },
  {
    "id": "ia-5.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Expiration of Cached Authenticators",
    "description": "Prohibit the use of cached authenticators after [time period].",
    "priority": "P3"
  },
  {
    "id": "ia-5.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Managing Content of PKI Trust Stores",
    "description": "For PKI-based authentication, employ an organization-wide methodology for managing the content of PKI trust stores installed across all platforms, including networks, operating systems, browsers, and applications.",
    "priority": "P3"
  },
  {
    "id": "ia-5.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "GSA-approved Products and Services",
    "description": "Use only General Services Administration-approved products and services for identity, credential, and access management.",
    "priority": "P3"
  },
  {
    "id": "ia-5.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "In-person or Trusted External Party Authenticator Issuance",
    "description": "Require that the issuance of [types of and/or specific authenticators] be conducted [choose: in person, by a trusted external party] before [registration authority] with authorization by [personnel or roles].",
    "priority": "P3",
    "relatedControls": [
      "ia-12"
    ]
  },
  {
    "id": "ia-5.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Presentation Attack Detection for Biometric Authenticators",
    "description": "Employ presentation attack detection mechanisms for biometric-based authentication.",
    "priority": "P3",
    "relatedControls": [
      "ac-7"
    ]
  },
  {
    "id": "ia-5.18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Password Managers",
    "description": "Employ [password managers] to generate and manage passwords; and Protect the passwords using [controls].",
    "priority": "P3"
  },
  {
    "id": "ia-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Public Key-based Authentication",
    "description": "For public key-based authentication: Enforce authorized access to the corresponding private key; and Map the authenticated identity to the account of the individual or group; and When public key infrastructure (PKI) is used: Validate certificates by constructing and verifying a certification path to an accepted trust anchor, including checking certificate status information; and Implement a local cache of revocation data to support path discovery and validation.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ia-3",
      "sc-17"
    ]
  },
  {
    "id": "ia-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "In-person or Trusted External Party Registration",
    "description": "In-person or Trusted External Party Registration",
    "priority": "P3"
  },
  {
    "id": "ia-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Automated Support for Password Strength Determination",
    "description": "Automated Support for Password Strength Determination",
    "priority": "P3"
  },
  {
    "id": "ia-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Change Authenticators Prior to Delivery",
    "description": "Require developers and installers of system components to provide unique authenticators or change default authenticators prior to delivery and installation.",
    "priority": "P3"
  },
  {
    "id": "ia-5.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Protection of Authenticators",
    "description": "Protect authenticators commensurate with the security category of the information to which use of the authenticator permits access.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-2"
    ]
  },
  {
    "id": "ia-5.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "No Embedded Unencrypted Static Authenticators",
    "description": "Ensure that unencrypted static authenticators are not embedded in applications or other forms of static storage.",
    "priority": "P3"
  },
  {
    "id": "ia-5.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Multiple System Accounts",
    "description": "Implement [security controls] to manage the risk of compromise due to individuals having accounts on multiple systems.",
    "priority": "P3",
    "relatedControls": [
      "ps-6"
    ]
  },
  {
    "id": "ia-5.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-5",
    "family": "Identification and Authentication",
    "title": "Federated Credential Management",
    "description": "Use the following external organizations to federate credentials: [external organizations].",
    "priority": "P3",
    "relatedControls": [
      "au-7",
      "au-16"
    ]
  },
  {
    "id": "ia-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Authentication Feedback",
    "description": "Obscure feedback of authentication information during the authentication process to protect the information from possible exploitation and use by unauthorized individuals.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "ia-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Cryptographic Module Authentication",
    "description": "Implement mechanisms for authentication to a cryptographic module that meet the requirements of applicable laws, executive orders, directives, policies, regulations, standards, and guidelines for such authentication.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00"
    ],
    "relatedControls": [
      "ac-3",
      "ia-5",
      "sa-4",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ia-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Identification and Authentication (Non-organizational Users)",
    "description": "Uniquely identify and authenticate non-organizational users or processes acting on behalf of non-organizational users.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "a1555677-2b9d-4868-a97b-a1363aff32f5",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "10963761-58fc-4b20-b3d6-b44a54daba03",
      "2100332a-16a5-4598-bacf-7261baea9711",
      "98d415ca-7281-4064-9931-0c366637e324"
    ],
    "relatedControls": [
      "ac-2",
      "ac-6",
      "ac-14",
      "ac-17",
      "ac-18",
      "au-6",
      "ia-2",
      "ia-4",
      "ia-5",
      "ia-10",
      "ia-11",
      "ia-13",
      "ma-4",
      "ra-3",
      "sa-4",
      "sc-8"
    ]
  },
  {
    "id": "ia-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Acceptance of PIV Credentials from Other Agencies",
    "description": "Accept and electronically verify Personal Identity Verification-compliant credentials from other federal agencies.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "pe-3"
    ]
  },
  {
    "id": "ia-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Acceptance of External Authenticators",
    "description": "Accept only external authenticators that are NIST-compliant; and Document and maintain a list of accepted external authenticators.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "ia-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Use of FICAM-approved Products",
    "description": "Use of FICAM-approved Products",
    "priority": "P3"
  },
  {
    "id": "ia-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Use of Defined Profiles",
    "description": "Conform to the following profiles for identity management [identity management profiles].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "ia-8.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Acceptance of PIV-I Credentials",
    "description": "Accept and verify federated or PKI credentials that meet [policy].",
    "priority": "P3"
  },
  {
    "id": "ia-8.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-8",
    "family": "Identification and Authentication",
    "title": "Disassociability",
    "description": "Implement the following measures to disassociate user attributes or identifier assertion relationships among individuals, credential service providers, and relying parties: [measures].",
    "priority": "P3"
  },
  {
    "id": "ia-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Identification and Authentication",
    "title": "Service Identification and Authentication",
    "description": "Uniquely identify and authenticate [system services and applications] before establishing communications with devices, users, or other services or applications.",
    "priority": "P3",
    "relatedControls": [
      "ia-3",
      "ia-4",
      "ia-5",
      "ia-13",
      "sc-8"
    ]
  },
  {
    "id": "ia-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-9",
    "family": "Identification and Authentication",
    "title": "Information Exchange",
    "description": "Information Exchange",
    "priority": "P3"
  },
  {
    "id": "ia-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ia-9",
    "family": "Identification and Authentication",
    "title": "Transmission of Decisions",
    "description": "Transmission of Decisions",
    "priority": "P3"
  },
  {
    "id": "ir-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] incident response policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the incident response policy and the associated incident response controls; Designate an [official] to manage the development, documentation, and dissemination of the incident response policy and procedures; and Review and update the current incident response: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "511f6832-23ca-49a3-8c0f-ce493373cab8",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb",
      "3dd249b0-f57d-44ba-a03e-c3eab1b835ff",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ir-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Integrated Information Security Analysis Team",
    "description": "Integrated Information Security Analysis Team",
    "priority": "P3"
  },
  {
    "id": "ir-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Response Training",
    "description": "Provide incident response training to system users consistent with assigned roles and responsibilities: Within [time period] of assuming an incident response role or responsibility or acquiring system access; When required by system changes; and [frequency] thereafter; and Review and update incident response training content [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "5f4705ac-8d17-438c-b23a-ac7f12362ae4",
      "511f6832-23ca-49a3-8c0f-ce493373cab8"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "at-4",
      "cp-3",
      "ir-3",
      "ir-4",
      "ir-8",
      "ir-9"
    ]
  },
  {
    "id": "ir-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-2",
    "family": "Incident Response",
    "title": "Simulated Events",
    "description": "Incorporate simulated events into incident response training to facilitate the required response by personnel in crisis situations.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ir-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-2",
    "family": "Incident Response",
    "title": "Automated Training Environments",
    "description": "Provide an incident response training environment using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ir-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-2",
    "family": "Incident Response",
    "title": "Breach",
    "description": "Provide incident response training on how to identify and respond to a breach, including the organization’s process for reporting a breach.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "ir-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Response Testing",
    "description": "Test the effectiveness of the incident response capability for the system [frequency] using the following tests: [tests].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "53be2fcf-cfd1-4bcb-896b-9a3b65c22098",
      "122177fa-c4ed-485d-8345-3082c0fb9a06"
    ],
    "relatedControls": [
      "cp-3",
      "cp-4",
      "ir-2",
      "ir-4",
      "ir-8",
      "pm-14"
    ]
  },
  {
    "id": "ir-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-3",
    "family": "Incident Response",
    "title": "Automated Testing",
    "description": "Test the incident response capability using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "ir-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-3",
    "family": "Incident Response",
    "title": "Coordination with Related Plans",
    "description": "Coordinate incident response testing with organizational elements responsible for related plans.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ir-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-3",
    "family": "Incident Response",
    "title": "Continuous Improvement",
    "description": "Use qualitative and quantitative data from testing to: Determine the effectiveness of incident response processes; Continuously improve incident response processes; and Provide incident response measures and metrics that are accurate, consistent, and in a reproducible format.",
    "priority": "P3"
  },
  {
    "id": "ir-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Handling",
    "description": "Implement an incident handling capability for incidents that is consistent with the incident response plan and includes preparation, detection and analysis, containment, eradication, and recovery; Coordinate incident handling activities with contingency planning activities; Incorporate lessons learned from ongoing incident handling activities into incident response procedures, training, and testing, and implement the resulting changes accordingly; and Ensure the rigor, intensity, scope, and results of incident handling activities are comparable and predictable across the organization.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "5f4705ac-8d17-438c-b23a-ac7f12362ae4",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb",
      "cfdb1858-c473-46b3-89f9-a700308d0be2",
      "10cf2fad-a216-41f9-bb1a-531b7e3119e3",
      "9ef4b43c-42a4-4316-87dc-ffaf528bc05c",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989",
      "31ae65ab-3f26-46b7-9d64-f25a4dac5778",
      "2be7b163-e50a-435c-8906-f1162f2a457a"
    ],
    "relatedControls": [
      "ac-19",
      "au-6",
      "au-7",
      "cm-6",
      "cp-2",
      "cp-3",
      "cp-4",
      "ir-2",
      "ir-3",
      "ir-5",
      "ir-6",
      "ir-8",
      "pe-6",
      "pl-2",
      "pm-12",
      "sa-8",
      "sc-5",
      "sc-7",
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "ir-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Automated Incident Handling Processes",
    "description": "Support the incident handling process using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ir-4.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Supply Chain Coordination",
    "description": "Coordinate incident handling activities involving supply chain events with other organizations involved in the supply chain.",
    "priority": "P3",
    "relatedControls": [
      "ca-3",
      "ma-2",
      "sa-9",
      "sr-8"
    ]
  },
  {
    "id": "ir-4.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Integrated Incident Response Team",
    "description": "Establish and maintain an integrated incident response team that can be deployed to any location identified by the organization in [time period].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "at-3"
    ]
  },
  {
    "id": "ir-4.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Malicious Code and Forensic Analysis",
    "description": "Analyze malicious code and/or other residual artifacts remaining in the system after the incident.",
    "priority": "P3"
  },
  {
    "id": "ir-4.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Behavior Analysis",
    "description": "Analyze anomalous or suspected adversarial behavior in or related to [environments or resources].",
    "priority": "P3"
  },
  {
    "id": "ir-4.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Security Operations Center",
    "description": "Establish and maintain a security operations center.",
    "priority": "P3"
  },
  {
    "id": "ir-4.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Public Relations and Reputation Repair",
    "description": "Manage public relations associated with an incident; and Employ measures to repair the reputation of the organization.",
    "priority": "P3"
  },
  {
    "id": "ir-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Dynamic Reconfiguration",
    "description": "Include the following types of dynamic reconfiguration for [system components] as part of the incident response capability: [types of dynamic reconfiguration].",
    "priority": "P3",
    "relatedControls": [
      "ac-2",
      "ac-4",
      "cm-2"
    ]
  },
  {
    "id": "ir-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Continuity of Operations",
    "description": "Identify [classes of incidents] and take the following actions in response to those incidents to ensure continuation of organizational mission and business functions: [actions].",
    "priority": "P3"
  },
  {
    "id": "ir-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Information Correlation",
    "description": "Correlate incident information and individual incident responses to achieve an organization-wide perspective on incident awareness and response.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ir-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Automatic Disabling of System",
    "description": "Implement a configurable capability to automatically disable the system if [security violations] are detected.",
    "priority": "P3"
  },
  {
    "id": "ir-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Insider Threats",
    "description": "Implement an incident handling capability for incidents involving insider threats.",
    "priority": "P3"
  },
  {
    "id": "ir-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Insider Threats — Intra-organization Coordination",
    "description": "Coordinate an incident handling capability for insider threats that includes the following organizational entities [entities].",
    "priority": "P3"
  },
  {
    "id": "ir-4.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Correlation with External Organizations",
    "description": "Coordinate with [external organizations] to correlate and share [incident information] to achieve a cross-organization perspective on incident awareness and more effective incident responses.",
    "priority": "P3",
    "relatedControls": [
      "au-16",
      "pm-16"
    ]
  },
  {
    "id": "ir-4.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-4",
    "family": "Incident Response",
    "title": "Dynamic Response Capability",
    "description": "Employ [dynamic response capabilities] to respond to incidents.",
    "priority": "P3"
  },
  {
    "id": "ir-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Monitoring",
    "description": "Track and document incidents.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb"
    ],
    "relatedControls": [
      "au-6",
      "au-7",
      "ir-4",
      "ir-6",
      "ir-8",
      "pe-6",
      "pm-5",
      "sc-5",
      "sc-7",
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "ir-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-5",
    "family": "Incident Response",
    "title": "Automated Tracking, Data Collection, and Analysis",
    "description": "Track incidents and collect and analyze incident information using [organization-defined automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ir-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Reporting",
    "description": "Require personnel to report suspected incidents to the organizational incident response capability within [time period] ; and Report incident information to [authorities].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "40b78258-c892-480e-9af8-77ac36648301",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb"
    ],
    "relatedControls": [
      "cm-6",
      "cp-2",
      "ir-4",
      "ir-5",
      "ir-8",
      "ir-9"
    ]
  },
  {
    "id": "ir-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-6",
    "family": "Incident Response",
    "title": "Automated Reporting",
    "description": "Report incidents using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ir-7"
    ]
  },
  {
    "id": "ir-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-6",
    "family": "Incident Response",
    "title": "Vulnerabilities Related to Incidents",
    "description": "Report system vulnerabilities associated with reported incidents to [personnel or roles].",
    "priority": "P3"
  },
  {
    "id": "ir-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-6",
    "family": "Incident Response",
    "title": "Supply Chain Coordination",
    "description": "Provide incident information to the provider of the product or service and other organizations involved in the supply chain or supply chain governance for systems or system components related to the incident.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sr-8"
    ]
  },
  {
    "id": "ir-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Response Assistance",
    "description": "Provide an incident response support resource, integral to the organizational incident response capability, that offers advice and assistance to users of the system for the handling and reporting of incidents.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "2be7b163-e50a-435c-8906-f1162f2a457a"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "ir-4",
      "ir-6",
      "ir-8",
      "pm-22",
      "pm-26",
      "sa-9",
      "si-18"
    ]
  },
  {
    "id": "ir-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-7",
    "family": "Incident Response",
    "title": "Automation Support for Availability of Information and Support",
    "description": "Increase the availability of incident response information and support using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ir-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-7",
    "family": "Incident Response",
    "title": "Coordination with External Providers",
    "description": "Establish a direct, cooperative relationship between its incident response capability and external providers of system protection capability; and Identify organizational incident response team members to the external providers.",
    "priority": "P3"
  },
  {
    "id": "ir-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Incident Response Plan",
    "description": "Develop an incident response plan that: Provides the organization with a roadmap for implementing its incident response capability; Describes the structure and organization of the incident response capability; Provides a high-level approach for how the incident response capability fits into the overall organization; Meets the unique requirements of the organization, which relate to mission, size, structure, and functions; Defines reportable incidents; Provides metrics for measuring the incident response capability within the organization; Defines the resources and management support needed to effectively maintain and mature an incident response capability; Addresses the sharing of incident information; Is reviewed and approved by [personnel or roles] [frequency] ; and Explicitly designates responsibility for incident response to [entities, personnel, or roles]. Distribute copies of the incident response plan to [incident response personnel]; Update the incident response plan to address system and organizational changes or problems encountered during plan implementation, execution, or testing; Communicate incident response plan changes to [organization-defined incident response personnel (identified by name and/or by role) and organizational elements] ; and Protect the incident response plan from unauthorized disclosure and modification.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb",
      "5f4705ac-8d17-438c-b23a-ac7f12362ae4"
    ],
    "relatedControls": [
      "ac-2",
      "cp-2",
      "cp-4",
      "ir-4",
      "ir-7",
      "ir-9",
      "pe-6",
      "pl-2",
      "sa-15",
      "si-12",
      "sr-8"
    ]
  },
  {
    "id": "ir-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-8",
    "family": "Incident Response",
    "title": "Breaches",
    "description": "Include the following in the Incident Response Plan for breaches involving personally identifiable information: A process to determine if notice to individuals or other organizations, including oversight organizations, is needed; An assessment process to determine the extent of the harm, embarrassment, inconvenience, or unfairness to affected individuals and any mechanisms to mitigate such harms; and Identification of applicable privacy requirements.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pt-1",
      "pt-2",
      "pt-3",
      "pt-4",
      "pt-5",
      "pt-7"
    ]
  },
  {
    "id": "ir-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Incident Response",
    "title": "Information Spillage Response",
    "description": "Respond to information spills by: Assigning [personnel or roles] with responsibility for responding to information spills; Identifying the specific information involved in the system contamination; Alerting [personnel or roles] of the information spill using a method of communication not associated with the spill; Isolating the contaminated system or system component; Eradicating the information from the contaminated system or component; Identifying other systems or system components that may have been subsequently contaminated; and Performing the following additional actions: [actions].",
    "priority": "P3",
    "relatedControls": [
      "cp-2",
      "ir-6",
      "pm-26",
      "pm-27",
      "pt-2",
      "pt-3",
      "pt-7",
      "ra-7"
    ]
  },
  {
    "id": "ir-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-9",
    "family": "Incident Response",
    "title": "Responsible Personnel",
    "description": "Responsible Personnel",
    "priority": "P3"
  },
  {
    "id": "ir-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-9",
    "family": "Incident Response",
    "title": "Training",
    "description": "Provide information spillage response training [frequency].",
    "priority": "P3",
    "relatedControls": [
      "at-2",
      "at-3",
      "cp-3",
      "ir-2"
    ]
  },
  {
    "id": "ir-9.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-9",
    "family": "Incident Response",
    "title": "Post-spill Operations",
    "description": "Implement the following procedures to ensure that organizational personnel impacted by information spills can continue to carry out assigned tasks while contaminated systems are undergoing corrective actions: [procedures].",
    "priority": "P3"
  },
  {
    "id": "ir-9.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ir-9",
    "family": "Incident Response",
    "title": "Exposure to Unauthorized Personnel",
    "description": "Employ the following controls for personnel exposed to information not within assigned access authorizations: [controls].",
    "priority": "P3"
  },
  {
    "id": "ma-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] maintenance policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the maintenance policy and the associated maintenance controls; Designate an [official] to manage the development, documentation, and dissemination of the maintenance policy and procedures; and Review and update the current maintenance: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ma-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Controlled Maintenance",
    "description": "Schedule, document, and review records of maintenance, repair, and replacement on system components in accordance with manufacturer or vendor specifications and/or organizational requirements; Approve and monitor all maintenance activities, whether performed on site or remotely and whether the system or system components are serviced on site or removed to another location; Require that [personnel or roles] explicitly approve the removal of the system or system components from organizational facilities for off-site maintenance, repair, or replacement; Sanitize equipment to remove the following information from associated media prior to removal from organizational facilities for off-site maintenance, repair, or replacement: [information]; Check all potentially impacted controls to verify that the controls are still functioning properly following maintenance, repair, or replacement actions; and Include the following information in organizational maintenance records: [information].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "cm-2",
      "cm-3",
      "cm-4",
      "cm-5",
      "cm-8",
      "ma-4",
      "mp-6",
      "pe-16",
      "si-2",
      "sr-3",
      "sr-4",
      "sr-11"
    ]
  },
  {
    "id": "ma-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-2",
    "family": "Maintenance",
    "title": "Record Content",
    "description": "Record Content",
    "priority": "P3"
  },
  {
    "id": "ma-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-2",
    "family": "Maintenance",
    "title": "Automated Maintenance Activities",
    "description": "Schedule, conduct, and document maintenance, repair, and replacement actions for the system using [organization-defined automated mechanisms] ; and Produce up-to date, accurate, and complete records of all maintenance, repair, and replacement actions requested, scheduled, in process, and completed.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ma-3"
    ]
  },
  {
    "id": "ma-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Maintenance Tools",
    "description": "Approve, control, and monitor the use of system maintenance tools; and Review previously approved system maintenance tools [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "a5b1d18d-e670-4586-9e6d-4a88b7ba3df6"
    ],
    "relatedControls": [
      "ma-2",
      "pe-16"
    ]
  },
  {
    "id": "ma-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Inspect Tools",
    "description": "Inspect the maintenance tools used by maintenance personnel for improper or unauthorized modifications.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "si-7"
    ]
  },
  {
    "id": "ma-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Inspect Media",
    "description": "Check media containing diagnostic and test programs for malicious code before the media are used in the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "si-3"
    ]
  },
  {
    "id": "ma-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Prevent Unauthorized Removal",
    "description": "Prevent the removal of maintenance equipment containing organizational information by: Verifying that there is no organizational information contained on the equipment; Sanitizing or destroying the equipment; Retaining the equipment within the facility; or Obtaining an exemption from [personnel or roles] explicitly authorizing removal of the equipment from the facility.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "mp-6"
    ]
  },
  {
    "id": "ma-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Restricted Tool Use",
    "description": "Restrict the use of maintenance tools to authorized personnel only.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-5",
      "ac-6"
    ]
  },
  {
    "id": "ma-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Execution with Privilege",
    "description": "Monitor the use of maintenance tools that execute with increased privilege.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-6"
    ]
  },
  {
    "id": "ma-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-3",
    "family": "Maintenance",
    "title": "Software Updates and Patches",
    "description": "Inspect maintenance tools to ensure the latest software updates and patches are installed.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-6"
    ]
  },
  {
    "id": "ma-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Nonlocal Maintenance",
    "description": "Approve and monitor nonlocal maintenance and diagnostic activities; Allow the use of nonlocal maintenance and diagnostic tools only as consistent with organizational policy and documented in the security plan for the system; Employ strong authentication in the establishment of nonlocal maintenance and diagnostic sessions; Maintain records for nonlocal maintenance and diagnostic activities; and Terminate session and network connections when nonlocal maintenance is completed.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "736d6310-e403-4b57-a79d-9967970c66d7",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "a5b1d18d-e670-4586-9e6d-4a88b7ba3df6"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-6",
      "ac-17",
      "au-2",
      "au-3",
      "ia-2",
      "ia-4",
      "ia-5",
      "ia-8",
      "ma-2",
      "ma-5",
      "pl-2",
      "sc-7",
      "sc-10"
    ]
  },
  {
    "id": "ma-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Logging and Review",
    "description": "Log [organization-defined audit events] for nonlocal maintenance and diagnostic sessions; and Review the audit records of the maintenance and diagnostic sessions to detect anomalous behavior.",
    "priority": "P3",
    "relatedControls": [
      "au-6",
      "au-12"
    ]
  },
  {
    "id": "ma-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Document Nonlocal Maintenance",
    "description": "Document Nonlocal Maintenance",
    "priority": "P3"
  },
  {
    "id": "ma-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Comparable Security and Sanitization",
    "description": "Require that nonlocal maintenance and diagnostic services be performed from a system that implements a security capability comparable to the capability implemented on the system being serviced; or Remove the component to be serviced from the system prior to nonlocal maintenance or diagnostic services; sanitize the component (for organizational information); and after the service is performed, inspect and sanitize the component (for potentially malicious software) before reconnecting the component to the system.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "mp-6",
      "si-3",
      "si-7"
    ]
  },
  {
    "id": "ma-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Authentication and Separation of Maintenance Sessions",
    "description": "Protect nonlocal maintenance sessions by: Employing [authenticators that are replay resistant] ; and Separating the maintenance sessions from other network sessions with the system by either: Physically separated communications paths; or Logically separated communications paths.",
    "priority": "P3"
  },
  {
    "id": "ma-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Approvals and Notifications",
    "description": "Require the approval of each nonlocal maintenance session by [personnel or roles] ; and Notify the following personnel or roles of the date and time of planned nonlocal maintenance: [personnel and roles].",
    "priority": "P3"
  },
  {
    "id": "ma-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Cryptographic Protection",
    "description": "Implement the following cryptographic mechanisms to protect the integrity and confidentiality of nonlocal maintenance and diagnostic communications: [cryptographic mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "ma-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-4",
    "family": "Maintenance",
    "title": "Disconnect Verification",
    "description": "Verify session and network connection termination after the completion of nonlocal maintenance and diagnostic sessions.",
    "priority": "P3",
    "relatedControls": [
      "ac-12"
    ]
  },
  {
    "id": "ma-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Maintenance Personnel",
    "description": "Establish a process for maintenance personnel authorization and maintain a list of authorized maintenance organizations or personnel; Verify that non-escorted personnel performing maintenance on the system possess the required access authorizations; and Designate organizational personnel with required access authorizations and technical competence to supervise the maintenance activities of personnel who do not possess the required access authorizations.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-5",
      "ac-6",
      "ia-2",
      "ia-8",
      "ma-4",
      "mp-2",
      "pe-2",
      "pe-3",
      "ps-7",
      "ra-3"
    ]
  },
  {
    "id": "ma-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-5",
    "family": "Maintenance",
    "title": "Individuals Without Appropriate Access",
    "description": "Implement procedures for the use of maintenance personnel that lack appropriate security clearances or are not U.S. citizens, that include the following requirements: Maintenance personnel who do not have needed access authorizations, clearances, or formal access approvals are escorted and supervised during the performance of maintenance and diagnostic activities on the system by approved organizational personnel who are fully cleared, have appropriate access authorizations, and are technically qualified; and Prior to initiating maintenance or diagnostic activities by personnel who do not have needed access authorizations, clearances or formal access approvals, all volatile information storage components within the system are sanitized and all nonvolatile storage media are removed or physically disconnected from the system and secured; and Develop and implement [alternate controls] in the event a system component cannot be sanitized, removed, or disconnected from the system.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "mp-6",
      "pl-2"
    ]
  },
  {
    "id": "ma-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-5",
    "family": "Maintenance",
    "title": "Security Clearances for Classified Systems",
    "description": "Verify that personnel performing maintenance and diagnostic activities on a system processing, storing, or transmitting classified information possess security clearances and formal access approvals for at least the highest classification level and for compartments of information on the system.",
    "priority": "P3",
    "relatedControls": [
      "ps-3"
    ]
  },
  {
    "id": "ma-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-5",
    "family": "Maintenance",
    "title": "Citizenship Requirements for Classified Systems",
    "description": "Verify that personnel performing maintenance and diagnostic activities on a system processing, storing, or transmitting classified information are U.S. citizens.",
    "priority": "P3",
    "relatedControls": [
      "ps-3"
    ]
  },
  {
    "id": "ma-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-5",
    "family": "Maintenance",
    "title": "Foreign Nationals",
    "description": "Ensure that: Foreign nationals with appropriate security clearances are used to conduct maintenance and diagnostic activities on classified systems only when the systems are jointly owned and operated by the United States and foreign allied governments, or owned and operated solely by foreign allied governments; and Approvals, consents, and detailed operational conditions regarding the use of foreign nationals to conduct maintenance and diagnostic activities on classified systems are fully documented within Memoranda of Agreements.",
    "priority": "P3",
    "relatedControls": [
      "ps-3"
    ]
  },
  {
    "id": "ma-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-5",
    "family": "Maintenance",
    "title": "Non-system Maintenance",
    "description": "Ensure that non-escorted personnel performing maintenance activities not directly associated with the system but in the physical proximity of the system, have required access authorizations.",
    "priority": "P3"
  },
  {
    "id": "ma-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Timely Maintenance",
    "description": "Obtain maintenance support and/or spare parts for [system components] within [time period] of failure.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-8",
      "cp-2",
      "cp-7",
      "ra-7",
      "sa-15",
      "si-13",
      "sr-2",
      "sr-3",
      "sr-4"
    ]
  },
  {
    "id": "ma-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-6",
    "family": "Maintenance",
    "title": "Preventive Maintenance",
    "description": "Perform preventive maintenance on [system components] at [time intervals].",
    "priority": "P3"
  },
  {
    "id": "ma-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-6",
    "family": "Maintenance",
    "title": "Predictive Maintenance",
    "description": "Perform predictive maintenance on [system components] at [time intervals].",
    "priority": "P3"
  },
  {
    "id": "ma-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ma-6",
    "family": "Maintenance",
    "title": "Automated Support for Predictive Maintenance",
    "description": "Transfer predictive maintenance data to a maintenance management system using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "ma-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Maintenance",
    "title": "Field Maintenance",
    "description": "Restrict or prohibit field maintenance on [systems or system components] to [trusted maintenance facilities].",
    "priority": "P3",
    "relatedControls": [
      "ma-2",
      "ma-4",
      "ma-5"
    ]
  },
  {
    "id": "mp-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] media protection policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the media protection policy and the associated media protection controls; Designate an [official] to manage the development, documentation, and dissemination of the media protection policy and procedures; and Review and update the current media protection: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "mp-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Access",
    "description": "Restrict access to [organization-defined types of digital and/or non-digital media] to [organization-defined personnel or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "22f2d4f0-4365-4e88-a30d-275c1f5473ea"
    ],
    "relatedControls": [
      "ac-19",
      "au-9",
      "cp-2",
      "cp-9",
      "cp-10",
      "ma-5",
      "mp-4",
      "mp-6",
      "pe-2",
      "pe-3",
      "sc-12",
      "sc-13",
      "sc-34",
      "si-12"
    ]
  },
  {
    "id": "mp-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-2",
    "family": "Media Protection",
    "title": "Automated Restricted Access",
    "description": "Automated Restricted Access",
    "priority": "P3"
  },
  {
    "id": "mp-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-2",
    "family": "Media Protection",
    "title": "Cryptographic Protection",
    "description": "Cryptographic Protection",
    "priority": "P3"
  },
  {
    "id": "mp-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Marking",
    "description": "Mark system media indicating the distribution limitations, handling caveats, and applicable security markings (if any) of the information; and Exempt [types of media exempted from marking] from marking if the media remain within [controlled areas].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "34a5571f-e252-4309-a8a1-2fdb2faefbcd",
      "91f992fb-f668-4c91-a50f-0f05b95ccee3",
      "628d22a1-6a11-4784-bc59-5cd9497b5445"
    ],
    "relatedControls": [
      "ac-16",
      "cp-9",
      "mp-5",
      "pe-22",
      "si-12"
    ]
  },
  {
    "id": "mp-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Storage",
    "description": "Physically control and securely store [organization-defined types of digital and/or non-digital media] within [organization-defined controlled areas] ; and Protect system media types defined in MP-4a until the media are destroyed or sanitized using approved equipment, techniques, and procedures.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "20957dbb-6a1e-40a2-b38a-66f67d33ac2e",
      "0d083d8a-5cc6-46f1-8d79-3081d42bcb75",
      "eef62b16-c796-4554-955c-505824135b8a",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "22f2d4f0-4365-4e88-a30d-275c1f5473ea"
    ],
    "relatedControls": [
      "ac-19",
      "cp-2",
      "cp-6",
      "cp-9",
      "cp-10",
      "mp-2",
      "mp-7",
      "pe-3",
      "pl-2",
      "sc-12",
      "sc-13",
      "sc-28",
      "sc-34",
      "si-12"
    ]
  },
  {
    "id": "mp-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-4",
    "family": "Media Protection",
    "title": "Cryptographic Protection",
    "description": "Cryptographic Protection",
    "priority": "P3"
  },
  {
    "id": "mp-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-4",
    "family": "Media Protection",
    "title": "Automated Restricted Access",
    "description": "Restrict access to media storage areas and log access attempts and access granted using [organization-defined automated mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "au-2",
      "au-6",
      "au-9",
      "au-12",
      "pe-3"
    ]
  },
  {
    "id": "mp-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Transport",
    "description": "Protect and control [types of system media] during transport outside of controlled areas using [organization-defined controls]; Maintain accountability for system media during transport outside of controlled areas; Document activities associated with the transport of system media; and Restrict the activities associated with the transport of system media to authorized personnel.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891"
    ],
    "relatedControls": [
      "ac-7",
      "ac-19",
      "cp-2",
      "cp-9",
      "mp-3",
      "mp-4",
      "pe-16",
      "pl-2",
      "sc-12",
      "sc-13",
      "sc-28",
      "sc-34"
    ]
  },
  {
    "id": "mp-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-5",
    "family": "Media Protection",
    "title": "Protection Outside of Controlled Areas",
    "description": "Protection Outside of Controlled Areas",
    "priority": "P3"
  },
  {
    "id": "mp-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-5",
    "family": "Media Protection",
    "title": "Documentation of Activities",
    "description": "Documentation of Activities",
    "priority": "P3"
  },
  {
    "id": "mp-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-5",
    "family": "Media Protection",
    "title": "Custodians",
    "description": "Employ an identified custodian during transport of system media outside of controlled areas.",
    "priority": "P3"
  },
  {
    "id": "mp-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-5",
    "family": "Media Protection",
    "title": "Cryptographic Protection",
    "description": "Cryptographic Protection",
    "priority": "P3"
  },
  {
    "id": "mp-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Sanitization",
    "description": "Sanitize [organization-defined system media] prior to disposal, release out of organizational control, or release for reuse using [organization-defined sanitization techniques and procedures] ; and Employ sanitization mechanisms with the strength and integrity commensurate with the security category or classification of the information.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "91f992fb-f668-4c91-a50f-0f05b95ccee3",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c28ae9a8-1121-42a9-a85e-00cfcc9b9a94",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "a5b1d18d-e670-4586-9e6d-4a88b7ba3df6",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327",
      "df9f87e9-71e7-4c74-9ac3-3cabd4e92f21"
    ],
    "relatedControls": [
      "ac-3",
      "ac-7",
      "au-11",
      "ma-2",
      "ma-3",
      "ma-4",
      "ma-5",
      "pm-22",
      "si-12",
      "si-18",
      "si-19",
      "sr-11"
    ]
  },
  {
    "id": "mp-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Review, Approve, Track, Document, and Verify",
    "description": "Review, approve, track, document, and verify media sanitization and disposal actions.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "mp-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Equipment Testing",
    "description": "Test sanitization equipment and procedures [organization-defined frequency] to ensure that the intended sanitization is being achieved.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "mp-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Nondestructive Techniques",
    "description": "Apply nondestructive sanitization techniques to portable storage devices prior to connecting such devices to the system under the following circumstances: [circumstances].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "mp-6.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Controlled Unclassified Information",
    "description": "Controlled Unclassified Information",
    "priority": "P3"
  },
  {
    "id": "mp-6.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Classified Information",
    "description": "Classified Information",
    "priority": "P3"
  },
  {
    "id": "mp-6.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Media Destruction",
    "description": "Media Destruction",
    "priority": "P3"
  },
  {
    "id": "mp-6.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Dual Authorization",
    "description": "Enforce dual authorization for the sanitization of [system media].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "mp-2"
    ]
  },
  {
    "id": "mp-6.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-6",
    "family": "Media Protection",
    "title": "Remote Purging or Wiping of Information",
    "description": "Provide the capability to purge or wipe information from [systems or system components] [choose: remotely, under {{ insert: param, mp-06.08_odp.03 }} ].",
    "priority": "P3"
  },
  {
    "id": "mp-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Use",
    "description": "[choose: restrict, prohibit] the use of [types of system media] on [systems or system components] using [controls] ; and Prohibit the use of portable storage devices in organizational systems when such devices have no identifiable owner.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "22f2d4f0-4365-4e88-a30d-275c1f5473ea"
    ],
    "relatedControls": [
      "ac-19",
      "ac-20",
      "pl-4",
      "pm-12",
      "sc-34",
      "sc-41"
    ]
  },
  {
    "id": "mp-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-7",
    "family": "Media Protection",
    "title": "Prohibit Use Without Owner",
    "description": "Prohibit Use Without Owner",
    "priority": "P3"
  },
  {
    "id": "mp-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-7",
    "family": "Media Protection",
    "title": "Prohibit Use of Sanitization-resistant Media",
    "description": "Prohibit the use of sanitization-resistant media in organizational systems.",
    "priority": "P3",
    "relatedControls": [
      "mp-6"
    ]
  },
  {
    "id": "mp-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Media Protection",
    "title": "Media Downgrading",
    "description": "Establish [system media downgrading process] that includes employing downgrading mechanisms with strength and integrity commensurate with the security category or classification of the information; Verify that the system media downgrading process is commensurate with the security category and/or classification level of the information to be removed and the access authorizations of the potential recipients of the downgraded information; Identify [system media requiring downgrading] ; and Downgrade the identified system media using the established process.",
    "priority": "P3",
    "references": [
      "91f992fb-f668-4c91-a50f-0f05b95ccee3",
      "df9f87e9-71e7-4c74-9ac3-3cabd4e92f21"
    ]
  },
  {
    "id": "mp-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-8",
    "family": "Media Protection",
    "title": "Documentation of Process",
    "description": "Document system media downgrading actions.",
    "priority": "P3"
  },
  {
    "id": "mp-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-8",
    "family": "Media Protection",
    "title": "Equipment Testing",
    "description": "Test downgrading equipment and procedures [organization-defined frequency] to ensure that downgrading actions are being achieved.",
    "priority": "P3"
  },
  {
    "id": "mp-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-8",
    "family": "Media Protection",
    "title": "Controlled Unclassified Information",
    "description": "Downgrade system media containing controlled unclassified information prior to public release.",
    "priority": "P3"
  },
  {
    "id": "mp-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "mp-8",
    "family": "Media Protection",
    "title": "Classified Information",
    "description": "Downgrade system media containing classified information prior to release to individuals without required access authorizations.",
    "priority": "P3"
  },
  {
    "id": "pe-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] physical and environmental protection policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the physical and environmental protection policy and the associated physical and environmental protection controls; Designate an [official] to manage the development, documentation, and dissemination of the physical and environmental protection policy and procedures; and Review and update the current physical and environmental protection: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "at-3",
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "pe-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Emergency Shutoff",
    "description": "Provide the capability of shutting off power to [system or individual system components] in emergency situations; Place emergency shutoff switches or devices in [location] to facilitate access for authorized personnel; and Protect emergency power shutoff capability from unauthorized activation.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "pe-15"
    ]
  },
  {
    "id": "pe-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-10",
    "family": "Physical and Environmental Protection",
    "title": "Accidental and Unauthorized Activation",
    "description": "Accidental and Unauthorized Activation",
    "priority": "P3"
  },
  {
    "id": "pe-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Emergency Power",
    "description": "Provide an uninterruptible power supply to facilitate [choose: an orderly shutdown of the system, transition of the system to long-term alternate power] in the event of a primary power source loss.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "at-3",
      "cp-2",
      "cp-7"
    ]
  },
  {
    "id": "pe-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-11",
    "family": "Physical and Environmental Protection",
    "title": "Alternate Power Supply — Minimal Operational Capability",
    "description": "Provide an alternate power supply for the system that is activated [choose: manually, automatically] and that can maintain minimally required operational capability in the event of an extended loss of the primary power source.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-11.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-11",
    "family": "Physical and Environmental Protection",
    "title": "Alternate Power Supply — Self-contained",
    "description": "Provide an alternate power supply for the system that is activated [choose: manually, automatically] and that is: Self-contained; Not reliant on external power generation; and Capable of maintaining [choose: minimally required operational capability, full operational capability] in the event of an extended loss of the primary power source.",
    "priority": "P3"
  },
  {
    "id": "pe-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Emergency Lighting",
    "description": "Employ and maintain automatic emergency lighting for the system that activates in the event of a power outage or disruption and that covers emergency exits and evacuation routes within the facility.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "cp-2",
      "cp-7"
    ]
  },
  {
    "id": "pe-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-12",
    "family": "Physical and Environmental Protection",
    "title": "Essential Mission and Business Functions",
    "description": "Provide emergency lighting for all areas within the facility supporting essential mission and business functions.",
    "priority": "P3"
  },
  {
    "id": "pe-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Fire Protection",
    "description": "Employ and maintain fire detection and suppression systems that are supported by an independent energy source.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "at-3"
    ]
  },
  {
    "id": "pe-13.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-13",
    "family": "Physical and Environmental Protection",
    "title": "Detection Systems — Automatic Activation and Notification",
    "description": "Employ fire detection systems that activate automatically and notify [personnel or roles] and [emergency responders] in the event of a fire.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "pe-13.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-13",
    "family": "Physical and Environmental Protection",
    "title": "Suppression Systems — Automatic Activation and Notification",
    "description": "Employ fire suppression systems that activate automatically and notify [personnel or roles] and [emergency responders] ; and Employ an automatic fire suppression capability when the facility is not staffed on a continuous basis.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-13.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-13",
    "family": "Physical and Environmental Protection",
    "title": "Automatic Fire Suppression",
    "description": "Automatic Fire Suppression",
    "priority": "P3"
  },
  {
    "id": "pe-13.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-13",
    "family": "Physical and Environmental Protection",
    "title": "Inspections",
    "description": "Ensure that the facility undergoes [frequency] fire protection inspections by authorized and qualified inspectors and identified deficiencies are resolved within [time period].",
    "priority": "P3"
  },
  {
    "id": "pe-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Environmental Controls",
    "description": "Maintain [choose: temperature, humidity, pressure, radiation, {{ insert: param, pe-14_odp.02 }} ] levels within the facility where the system resides at [acceptable levels] ; and Monitor environmental control levels [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "at-3",
      "cp-2"
    ]
  },
  {
    "id": "pe-14.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-14",
    "family": "Physical and Environmental Protection",
    "title": "Automatic Controls",
    "description": "Employ the following automatic environmental controls in the facility to prevent fluctuations potentially harmful to the system: [automatic environmental controls].",
    "priority": "P3"
  },
  {
    "id": "pe-14.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-14",
    "family": "Physical and Environmental Protection",
    "title": "Monitoring with Alarms and Notifications",
    "description": "Employ environmental control monitoring that provides an alarm or notification of changes potentially harmful to personnel or equipment to [personnel or roles].",
    "priority": "P3"
  },
  {
    "id": "pe-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Water Damage Protection",
    "description": "Protect the system from damage resulting from water leakage by providing master shutoff or isolation valves that are accessible, working properly, and known to key personnel.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "at-3",
      "pe-10"
    ]
  },
  {
    "id": "pe-15.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-15",
    "family": "Physical and Environmental Protection",
    "title": "Automation Support",
    "description": "Detect the presence of water near the system and alert [personnel or roles] using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Delivery and Removal",
    "description": "Authorize and control [organization-defined types of system components] entering and exiting the facility; and Maintain records of the system components.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "cm-3",
      "cm-8",
      "ma-2",
      "ma-3",
      "mp-5",
      "pe-20",
      "sr-2",
      "sr-3",
      "sr-4",
      "sr-6"
    ]
  },
  {
    "id": "pe-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Alternate Work Site",
    "description": "Determine and document the [alternate work sites] allowed for use by employees; Employ the following controls at alternate work sites: [controls]; Assess the effectiveness of controls at alternate work sites; and Provide a means for employees to communicate with information security and privacy personnel in case of incidents.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "83b9d63b-66b1-467c-9f3b-3a0b108771e9"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "cp-7"
    ]
  },
  {
    "id": "pe-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Location of System Components",
    "description": "Position system components within the facility to minimize potential damage from [physical and environmental hazards] and to minimize the opportunity for unauthorized access.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-2",
      "pe-5",
      "pe-19",
      "pe-20",
      "ra-3"
    ]
  },
  {
    "id": "pe-18.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-18",
    "family": "Physical and Environmental Protection",
    "title": "Facility Site",
    "description": "Facility Site",
    "priority": "P3"
  },
  {
    "id": "pe-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Information Leakage",
    "description": "Protect the system from information leakage due to electromagnetic signals emanations.",
    "priority": "P3",
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445"
    ],
    "relatedControls": [
      "ac-18",
      "pe-18",
      "pe-20"
    ]
  },
  {
    "id": "pe-19.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-19",
    "family": "Physical and Environmental Protection",
    "title": "National Emissions Policies and Procedures",
    "description": "Protect system components, associated data communications, and networks in accordance with national Emissions Security policies and procedures based on the security category or classification of the information.",
    "priority": "P3"
  },
  {
    "id": "pe-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Physical Access Authorizations",
    "description": "Develop, approve, and maintain a list of individuals with authorized access to the facility where the system resides; Issue authorization credentials for facility access; Review the access list detailing authorized facility access by individuals [frequency] ; and Remove individuals from the facility access list when access is no longer required.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d"
    ],
    "relatedControls": [
      "at-3",
      "au-9",
      "ia-4",
      "ma-5",
      "mp-2",
      "pe-3",
      "pe-4",
      "pe-5",
      "pe-8",
      "pm-12",
      "ps-3",
      "ps-4",
      "ps-5",
      "ps-6"
    ]
  },
  {
    "id": "pe-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-2",
    "family": "Physical and Environmental Protection",
    "title": "Access by Position or Role",
    "description": "Authorize physical access to the facility where the system resides based on position or role.",
    "priority": "P3",
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-6"
    ]
  },
  {
    "id": "pe-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-2",
    "family": "Physical and Environmental Protection",
    "title": "Two Forms of Identification",
    "description": "Require two forms of identification from the following forms of identification for visitor access to the facility where the system resides: [list of acceptable forms of identification].",
    "priority": "P3",
    "relatedControls": [
      "ia-2",
      "ia-4",
      "ia-5"
    ]
  },
  {
    "id": "pe-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-2",
    "family": "Physical and Environmental Protection",
    "title": "Restrict Unescorted Access",
    "description": "Restrict unescorted access to the facility where the system resides to personnel with [choose: security clearances for all information contained within the system, formal access authorizations for all information contained within the system, need for access to all information contained within the system, {{ insert: param, pe-02.03_odp.02 }} ].",
    "priority": "P3",
    "relatedControls": [
      "ps-2",
      "ps-6"
    ]
  },
  {
    "id": "pe-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Asset Monitoring and Tracking",
    "description": "Employ [asset location technologies] to track and monitor the location and movement of [assets] within [controlled areas].",
    "priority": "P3",
    "relatedControls": [
      "cm-8",
      "pe-16",
      "pm-8"
    ]
  },
  {
    "id": "pe-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Electromagnetic Pulse Protection",
    "description": "Employ [protective measures] against electromagnetic pulse damage for [system and system components].",
    "priority": "P3",
    "relatedControls": [
      "pe-18",
      "pe-19"
    ]
  },
  {
    "id": "pe-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Component Marking",
    "description": "Mark [system hardware components] indicating the impact level or classification level of the information permitted to be processed, stored, or transmitted by the hardware component.",
    "priority": "P3",
    "references": [
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-16",
      "mp-3"
    ]
  },
  {
    "id": "pe-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Facility Location",
    "description": "Plan the location or site of the facility where the system resides considering physical and environmental hazards; and For existing facilities, consider the physical and environmental hazards in the organizational risk management strategy.",
    "priority": "P3",
    "relatedControls": [
      "cp-2",
      "pe-18",
      "pe-19",
      "pm-8",
      "pm-9",
      "ra-3"
    ]
  },
  {
    "id": "pe-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Physical Access Control",
    "description": "Enforce physical access authorizations at [entry and exit points] by: Verifying individual access authorizations before granting access to the facility; and Controlling ingress and egress to the facility using [choose: {{ insert: param, pe-03_odp.03 }} , guards]; Maintain physical access audit logs for [entry or exit points]; Control access to areas within the facility designated as publicly accessible by implementing the following controls: [physical access controls]; Escort visitors and control visitor activity [circumstances]; Secure keys, combinations, and other physical access devices; Inventory [physical access devices] every [frequency] ; and Change combinations and keys [organization-defined frequency] and/or when keys are lost, combinations are compromised, or when individuals possessing the keys or combinations are transferred or terminated.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d",
      "2100332a-16a5-4598-bacf-7261baea9711"
    ],
    "relatedControls": [
      "at-3",
      "au-2",
      "au-6",
      "au-9",
      "au-13",
      "cp-10",
      "ia-3",
      "ia-8",
      "ma-5",
      "mp-2",
      "mp-4",
      "pe-2",
      "pe-4",
      "pe-5",
      "pe-8",
      "ps-2",
      "ps-3",
      "ps-6",
      "ps-7",
      "ra-3",
      "sc-28",
      "si-4",
      "sr-3"
    ]
  },
  {
    "id": "pe-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "System Access",
    "description": "Enforce physical access authorizations to the system in addition to the physical access controls for the facility at [physical spaces].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Facility and Systems",
    "description": "Perform security checks [frequency] at the physical perimeter of the facility or system for exfiltration of information or removal of system components.",
    "priority": "P3",
    "relatedControls": [
      "ac-4",
      "sc-7"
    ]
  },
  {
    "id": "pe-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Continuous Guards",
    "description": "Employ guards to control [physical access points] to the facility where the system resides 24 hours per day, 7 days per week.",
    "priority": "P3",
    "relatedControls": [
      "cp-6",
      "cp-7",
      "pe-6"
    ]
  },
  {
    "id": "pe-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Lockable Casings",
    "description": "Use lockable physical casings to protect [system components] from unauthorized physical access.",
    "priority": "P3"
  },
  {
    "id": "pe-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Tamper Protection",
    "description": "Employ [anti-tamper technologies] to [choose: detect, prevent] physical tampering or alteration of [hardware components] within the system.",
    "priority": "P3",
    "relatedControls": [
      "sa-16",
      "sr-9",
      "sr-11"
    ]
  },
  {
    "id": "pe-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Facility Penetration Testing",
    "description": "Facility Penetration Testing",
    "priority": "P3"
  },
  {
    "id": "pe-3.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Physical Barriers",
    "description": "Limit access using physical barriers.",
    "priority": "P3"
  },
  {
    "id": "pe-3.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-3",
    "family": "Physical and Environmental Protection",
    "title": "Access Control Vestibules",
    "description": "Employ access control vestibules at [locations].",
    "priority": "P3"
  },
  {
    "id": "pe-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Access Control for Transmission",
    "description": "Control physical access to [system distribution and transmission lines] within organizational facilities using [security controls].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "at-3",
      "ia-4",
      "mp-2",
      "mp-4",
      "pe-2",
      "pe-3",
      "pe-5",
      "pe-9",
      "sc-7",
      "sc-8"
    ]
  },
  {
    "id": "pe-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Access Control for Output Devices",
    "description": "Control physical access to output from [output devices] to prevent unauthorized individuals from obtaining the output.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "pe-2",
      "pe-3",
      "pe-4",
      "pe-18"
    ]
  },
  {
    "id": "pe-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-5",
    "family": "Physical and Environmental Protection",
    "title": "Access to Output by Authorized Individuals",
    "description": "Access to Output by Authorized Individuals",
    "priority": "P3"
  },
  {
    "id": "pe-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-5",
    "family": "Physical and Environmental Protection",
    "title": "Link to Individual Identity",
    "description": "Link individual identity to receipt of output from output devices.",
    "priority": "P3"
  },
  {
    "id": "pe-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-5",
    "family": "Physical and Environmental Protection",
    "title": "Marking Output Devices",
    "description": "Marking Output Devices",
    "priority": "P3"
  },
  {
    "id": "pe-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Monitoring Physical Access",
    "description": "Monitor physical access to the facility where the system resides to detect and respond to physical security incidents; Review physical access logs [frequency] and upon occurrence of [events] ; and Coordinate results of reviews and investigations with the organizational incident response capability.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-6",
      "au-9",
      "au-12",
      "ca-7",
      "cp-10",
      "ir-4",
      "ir-8"
    ]
  },
  {
    "id": "pe-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-6",
    "family": "Physical and Environmental Protection",
    "title": "Intrusion Alarms and Surveillance Equipment",
    "description": "Monitor physical access to the facility where the system resides using physical intrusion alarms and surveillance equipment.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "pe-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-6",
    "family": "Physical and Environmental Protection",
    "title": "Automated Intrusion Recognition and Responses",
    "description": "Recognize [classes or types of intrusions] and initiate [response actions] using [automated mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "si-4"
    ]
  },
  {
    "id": "pe-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-6",
    "family": "Physical and Environmental Protection",
    "title": "Video Surveillance",
    "description": "Employ video surveillance of [operational areas]; Review video recordings [frequency] ; and Retain video recordings for [time period].",
    "priority": "P3"
  },
  {
    "id": "pe-6.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-6",
    "family": "Physical and Environmental Protection",
    "title": "Monitoring Physical Access to Systems",
    "description": "Monitor physical access to the system in addition to the physical access monitoring of the facility at [physical spaces].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Visitor Control",
    "description": "Visitor Control",
    "priority": "P3"
  },
  {
    "id": "pe-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Visitor Access Records",
    "description": "Maintain visitor access records to the facility where the system resides for [time period]; Review visitor access records [frequency] ; and Report anomalies in visitor access records to [personnel].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "relatedControls": [
      "pe-2",
      "pe-3",
      "pe-6"
    ]
  },
  {
    "id": "pe-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-8",
    "family": "Physical and Environmental Protection",
    "title": "Automated Records Maintenance and Review",
    "description": "Maintain and review visitor access records using [organization-defined automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "pe-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-8",
    "family": "Physical and Environmental Protection",
    "title": "Physical Access Records",
    "description": "Physical Access Records",
    "priority": "P3"
  },
  {
    "id": "pe-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-8",
    "family": "Physical and Environmental Protection",
    "title": "Limit Personally Identifiable Information Elements",
    "description": "Limit personally identifiable information contained in visitor access records to the following elements identified in the privacy risk assessment: [elements].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "ra-3",
      "sa-8"
    ]
  },
  {
    "id": "pe-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Physical and Environmental Protection",
    "title": "Power Equipment and Cabling",
    "description": "Protect power equipment and power cabling for the system from damage and destruction.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "pe-4"
    ]
  },
  {
    "id": "pe-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-9",
    "family": "Physical and Environmental Protection",
    "title": "Redundant Cabling",
    "description": "Employ redundant power cabling paths that are physically separated by [distance].",
    "priority": "P3"
  },
  {
    "id": "pe-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pe-9",
    "family": "Physical and Environmental Protection",
    "title": "Automatic Voltage Controls",
    "description": "Employ automatic voltage controls for [critical system components].",
    "priority": "P3"
  },
  {
    "id": "pl-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] planning policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the planning policy and the associated planning controls; Designate an [official] to manage the development, documentation, and dissemination of the planning policy and procedures; and Review and update the current planning: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "30eb758a-2707-4bca-90ad-949a74d4eb16",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "pl-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Baseline Selection",
    "description": "Select a control baseline for the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "599fb53d-5041-444e-a7fe-640d6d30ad05",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "46d9e201-840e-440e-987c-2c773333c752",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "4e4fbc93-333d-45e6-a875-de36b878b6b9"
    ],
    "relatedControls": [
      "pl-2",
      "pl-11",
      "ra-2",
      "ra-3",
      "sa-8"
    ]
  },
  {
    "id": "pl-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Baseline Tailoring",
    "description": "Tailor the selected control baseline by applying specified tailoring actions.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "599fb53d-5041-444e-a7fe-640d6d30ad05",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "46d9e201-840e-440e-987c-2c773333c752",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "4e4fbc93-333d-45e6-a875-de36b878b6b9"
    ],
    "relatedControls": [
      "pl-10",
      "ra-2",
      "ra-3",
      "ra-9",
      "sa-8"
    ]
  },
  {
    "id": "pl-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "System Security and Privacy Plans",
    "description": "Develop security and privacy plans for the system that: Are consistent with the organization’s enterprise architecture; Explicitly define the constituent system components; Describe the operational context of the system in terms of mission and business processes; Identify the individuals that fulfill system roles and responsibilities; Identify the information types processed, stored, and transmitted by the system; Provide the security categorization of the system, including supporting rationale; Describe any specific threats to the system that are of concern to the organization; Provide the results of a privacy risk assessment for systems processing personally identifiable information; Describe the operational environment for the system and any dependencies on or connections to other systems or system components; Provide an overview of the security and privacy requirements for the system; Identify any relevant control baselines or overlays, if applicable; Describe the controls in place or planned for meeting the security and privacy requirements, including a rationale for any tailoring decisions; Include risk determinations for security and privacy architecture and design decisions; Include security- and privacy-related activities affecting the system that require planning and coordination with [individuals or groups] ; and Are reviewed and approved by the authorizing official or designated representative prior to plan implementation. Distribute copies of the plans and communicate subsequent changes to the plans to [personnel or roles]; Review the plans [frequency]; Update the plans to address changes to the system and environment of operation or problems identified during plan implementation or control assessments; and Protect the plans from unauthorized disclosure and modification.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "30eb758a-2707-4bca-90ad-949a74d4eb16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "ac-2",
      "ac-6",
      "ac-14",
      "ac-17",
      "ac-20",
      "ca-2",
      "ca-3",
      "ca-7",
      "cm-9",
      "cm-13",
      "cp-2",
      "cp-4",
      "ir-4",
      "ir-8",
      "ma-4",
      "ma-5",
      "mp-4",
      "mp-5",
      "pl-7",
      "pl-8",
      "pl-10",
      "pl-11",
      "pm-1",
      "pm-7",
      "pm-8",
      "pm-9",
      "pm-10",
      "pm-11",
      "ra-3",
      "ra-8",
      "ra-9",
      "sa-5",
      "sa-17",
      "sa-22",
      "si-12",
      "sr-2",
      "sr-4"
    ]
  },
  {
    "id": "pl-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-2",
    "family": "Planning",
    "title": "Concept of Operations",
    "description": "Concept of Operations",
    "priority": "P3"
  },
  {
    "id": "pl-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-2",
    "family": "Planning",
    "title": "Functional Architecture",
    "description": "Functional Architecture",
    "priority": "P3"
  },
  {
    "id": "pl-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-2",
    "family": "Planning",
    "title": "Plan and Coordinate with Other Organizational Entities",
    "description": "Plan and Coordinate with Other Organizational Entities",
    "priority": "P3"
  },
  {
    "id": "pl-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "System Security Plan Update",
    "description": "System Security Plan Update",
    "priority": "P3"
  },
  {
    "id": "pl-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Rules of Behavior",
    "description": "Establish and provide to individuals requiring access to the system, the rules that describe their responsibilities and expected behavior for information and system usage, security, and privacy; Receive a documented acknowledgment from such individuals, indicating that they have read, understand, and agree to abide by the rules of behavior, before authorizing access to information and the system; Review and update the rules of behavior [frequency] ; and Require individuals who have acknowledged a previous version of the rules of behavior to read and re-acknowledge [choose: {{ insert: param, pl-04_odp.03 }} , when the rules are revised or updated].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "30eb758a-2707-4bca-90ad-949a74d4eb16"
    ],
    "relatedControls": [
      "ac-2",
      "ac-6",
      "ac-8",
      "ac-9",
      "ac-17",
      "ac-18",
      "ac-19",
      "ac-20",
      "at-2",
      "at-3",
      "cm-11",
      "ia-2",
      "ia-4",
      "ia-5",
      "mp-7",
      "ps-6",
      "ps-8",
      "sa-5",
      "si-12"
    ]
  },
  {
    "id": "pl-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-4",
    "family": "Planning",
    "title": "Social Media and External Site/Application Usage Restrictions",
    "description": "Include in the rules of behavior, restrictions on: Use of social media, social networking sites, and external sites/applications; Posting organizational information on public websites; and Use of organization-provided identifiers (e.g., email addresses) and authentication secrets (e.g., passwords) for creating accounts on external sites/applications.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "relatedControls": [
      "ac-22",
      "au-13"
    ]
  },
  {
    "id": "pl-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Privacy Impact Assessment",
    "description": "Privacy Impact Assessment",
    "priority": "P3"
  },
  {
    "id": "pl-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Security-related Activity Planning",
    "description": "Security-related Activity Planning",
    "priority": "P3"
  },
  {
    "id": "pl-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Concept of Operations",
    "description": "Develop a Concept of Operations (CONOPS) for the system describing how the organization intends to operate the system from the perspective of information security and privacy; and Review and update the CONOPS [frequency].",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "pl-2",
      "sa-2",
      "si-12"
    ]
  },
  {
    "id": "pl-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Security and Privacy Architectures",
    "description": "Develop security and privacy architectures for the system that: Describe the requirements and approach to be taken for protecting the confidentiality, integrity, and availability of organizational information; Describe the requirements and approach to be taken for processing personally identifiable information to minimize privacy risk to individuals; Describe how the architectures are integrated into and support the enterprise architecture; and Describe any assumptions about, and dependencies on, external systems and services; Review and update the architectures [frequency] to reflect changes in the enterprise architecture; and Reflect planned architecture changes in security and privacy plans, Concept of Operations (CONOPS), criticality analysis, organizational procedures, and procurements and acquisitions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "cm-2",
      "cm-6",
      "pl-2",
      "pl-7",
      "pl-9",
      "pm-5",
      "pm-7",
      "ra-9",
      "sa-3",
      "sa-5",
      "sa-8",
      "sa-17",
      "sc-7"
    ]
  },
  {
    "id": "pl-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-8",
    "family": "Planning",
    "title": "Defense in Depth",
    "description": "Design the security and privacy architectures for the system using a defense-in-depth approach that: Allocates [controls] to [locations and architectural layers] ; and Ensures that the allocated controls operate in a coordinated and mutually reinforcing manner.",
    "priority": "P3",
    "relatedControls": [
      "sc-2",
      "sc-3",
      "sc-29",
      "sc-36"
    ]
  },
  {
    "id": "pl-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pl-8",
    "family": "Planning",
    "title": "Supplier Diversity",
    "description": "Require that [controls] allocated to [locations and architectural layers] are obtained from different suppliers.",
    "priority": "P3",
    "relatedControls": [
      "sc-29",
      "sr-3"
    ]
  },
  {
    "id": "pl-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Planning",
    "title": "Central Management",
    "description": "Centrally manage [controls and related processes].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8"
    ],
    "relatedControls": [
      "pl-8",
      "pm-9"
    ]
  },
  {
    "id": "pm-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Information Security Program Plan",
    "description": "Develop and disseminate an organization-wide information security program plan that: Provides an overview of the requirements for the security program and a description of the security program management controls and common controls in place or planned for meeting those requirements; Includes the identification and assignment of roles, responsibilities, management commitment, coordination among organizational entities, and compliance; Reflects the coordination among organizational entities responsible for information security; and Is approved by a senior official with responsibility and accountability for the risk being incurred to organizational operations (including mission, functions, image, and reputation), organizational assets, individuals, other organizations, and the Nation; Review and update the organization-wide information security program plan [frequency] and following [events] ; and Protect the information security program plan from unauthorized disclosure and modification.",
    "priority": "P3",
    "references": [
      "0c67b2a9-bede-43d2-b86d-5f35b8be36e9",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2"
    ],
    "relatedControls": [
      "pl-2",
      "pm-18",
      "pm-30",
      "ra-9",
      "si-12",
      "sr-2"
    ]
  },
  {
    "id": "pm-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Authorization Process",
    "description": "Manage the security and privacy state of organizational systems and the environments in which those systems operate through authorization processes; Designate individuals to fulfill specific roles and responsibilities within the organizational risk management process; and Integrate the authorization processes into an organization-wide risk management program.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ],
    "relatedControls": [
      "ca-6",
      "ca-7",
      "pl-2"
    ]
  },
  {
    "id": "pm-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Mission and Business Process Definition",
    "description": "Define organizational mission and business processes with consideration for information security and privacy and the resulting risk to organizational operations, organizational assets, individuals, other organizations, and the Nation; and Determine information protection and personally identifiable information processing needs arising from the defined mission and business processes; and Review and revise the mission and business processes [frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "cp-2",
      "pl-2",
      "pm-7",
      "pm-8",
      "ra-2",
      "ra-3",
      "ra-9",
      "sa-2"
    ]
  },
  {
    "id": "pm-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Insider Threat Program",
    "description": "Implement an insider threat program that includes a cross-discipline insider threat incident handling team.",
    "priority": "P3",
    "references": [
      "0af071a6-cf8e-48ee-8c82-fe91efa20f94",
      "528135e3-c65b-461a-93d3-46513610f792",
      "06d74ea9-2178-449c-a9c5-b2980f804ac8"
    ],
    "relatedControls": [
      "ac-6",
      "at-2",
      "au-6",
      "au-7",
      "au-10",
      "au-12",
      "au-13",
      "ca-7",
      "ia-4",
      "ir-4",
      "mp-7",
      "pe-2",
      "pm-16",
      "ps-3",
      "ps-4",
      "ps-5",
      "ps-7",
      "ps-8",
      "sc-7",
      "sc-38",
      "si-4",
      "pm-14"
    ]
  },
  {
    "id": "pm-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Security and Privacy Workforce",
    "description": "Establish a security and privacy workforce development and improvement program.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ],
    "relatedControls": [
      "at-2",
      "at-3"
    ]
  },
  {
    "id": "pm-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Testing, Training, and Monitoring",
    "description": "Implement a process for ensuring that organizational plans for conducting security and privacy testing, training, and monitoring activities associated with organizational systems: Are developed and maintained; and Continue to be executed; and Review testing, training, and monitoring plans for consistency with the organizational risk management strategy and organization-wide priorities for risk response actions.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "122177fa-c4ed-485d-8345-3082c0fb9a06",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "ca-7",
      "cp-4",
      "ir-3",
      "pm-12",
      "si-4"
    ]
  },
  {
    "id": "pm-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Security and Privacy Groups and Associations",
    "description": "Establish and institutionalize contact with selected groups and associations within the security and privacy communities: To facilitate ongoing security and privacy education and training for organizational personnel; To maintain currency with recommended security and privacy practices, techniques, and technologies; and To share current security and privacy information, including threats, vulnerabilities, and incidents.",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "sa-11",
      "si-5"
    ]
  },
  {
    "id": "pm-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Threat Awareness Program",
    "description": "Implement a threat awareness program that includes a cross-organization information-sharing capability for threat intelligence.",
    "priority": "P3",
    "relatedControls": [
      "ir-4",
      "pm-12"
    ]
  },
  {
    "id": "pm-16.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pm-16",
    "family": "Program Management",
    "title": "Automated Means for Sharing Threat Intelligence",
    "description": "Employ automated mechanisms to maximize the effectiveness of sharing threat intelligence information.",
    "priority": "P3"
  },
  {
    "id": "pm-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Protecting Controlled Unclassified Information on External Systems",
    "description": "Establish policy and procedures to ensure that requirements for the protection of controlled unclassified information that is processed, stored or transmitted on external systems, are implemented in accordance with applicable laws, executive orders, directives, policies, regulations, and standards; and Review and update the policy and procedures [organization-defined frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "91f992fb-f668-4c91-a50f-0f05b95ccee3",
      "7dbd6d9f-29d6-4d1d-9766-f2d77ff3c849",
      "f26af0d0-6d72-4a9d-8ecd-01bc21fd4f0e",
      "c28ae9a8-1121-42a9-a85e-00cfcc9b9a94"
    ],
    "relatedControls": [
      "ca-6",
      "pm-10"
    ]
  },
  {
    "id": "pm-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Privacy Program Plan",
    "description": "Develop and disseminate an organization-wide privacy program plan that provides an overview of the agency’s privacy program, and: Includes a description of the structure of the privacy program and the resources dedicated to the privacy program; Provides an overview of the requirements for the privacy program and a description of the privacy program management controls and common controls in place or planned for meeting those requirements; Includes the role of the senior agency official for privacy and the identification and assignment of roles of other privacy officials and staff and their responsibilities; Describes management commitment, compliance, and the strategic goals and objectives of the privacy program; Reflects coordination among organizational entities responsible for the different aspects of privacy; and Is approved by a senior official with responsibility and accountability for the privacy risk being incurred to organizational operations (including mission, functions, image, and reputation), organizational assets, individuals, other organizations, and the Nation; and Update the plan [frequency] and to address changes in federal privacy laws and policy and organizational changes and problems identified during plan implementation or privacy control assessments.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "pm-8",
      "pm-9",
      "pm-19"
    ]
  },
  {
    "id": "pm-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Privacy Program Leadership Role",
    "description": "Appoint a senior agency official for privacy with the authority, mission, accountability, and resources to coordinate, develop, and implement, applicable privacy requirements and manage privacy risks through the organization-wide privacy program.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "pm-18",
      "pm-20",
      "pm-23",
      "pm-24",
      "pm-27"
    ]
  },
  {
    "id": "pm-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Information Security Program Leadership Role",
    "description": "Appoint a senior agency information security officer with the mission and resources to coordinate, develop, implement, and maintain an organization-wide information security program.",
    "priority": "P3",
    "references": [
      "81c44706-0227-4258-a920-620a4d259990",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ]
  },
  {
    "id": "pm-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Dissemination of Privacy Program Information",
    "description": "Maintain a central resource webpage on the organization’s principal public website that serves as a central source of information about the organization’s privacy program and that: Ensures that the public has access to information about organizational privacy activities and can communicate with its senior agency official for privacy; Ensures that organizational privacy practices and reports are publicly available; and Employs publicly facing email addresses and/or phone lines to enable the public to provide feedback and/or direct questions to privacy offices regarding privacy practices.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "206a3284-6a7e-423c-8ea9-25b22542541d"
    ],
    "relatedControls": [
      "ac-3",
      "pm-19",
      "pt-5",
      "pt-6",
      "pt-7",
      "ra-8"
    ]
  },
  {
    "id": "pm-20.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pm-20",
    "family": "Program Management",
    "title": "Privacy Policies on Websites, Applications, and Digital Services",
    "description": "Develop and post privacy policies on all external-facing websites, mobile applications, and other digital services, that: Are written in plain language and organized in a way that is easy to understand and navigate; Provide information needed by the public to make an informed decision about whether and how to interact with the organization; and Are updated whenever the organization makes a substantive change to the practices it describes and includes a time/date stamp to inform the public of the date of the most recent changes.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "pm-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Accounting of Disclosures",
    "description": "Develop and maintain an accurate accounting of disclosures of personally identifiable information, including: Date, nature, and purpose of each disclosure; and Name and address, or other contact information of the individual or organization to which the disclosure was made; Retain the accounting of disclosures for the length of the time the personally identifiable information is maintained or five years after the disclosure is made, whichever is longer; and Make the accounting of disclosures available to the individual to whom the personally identifiable information relates upon request.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ac-3",
      "au-2",
      "pt-2"
    ]
  },
  {
    "id": "pm-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Personally Identifiable Information Quality Management",
    "description": "Develop and document organization-wide policies and procedures for: Reviewing for the accuracy, relevance, timeliness, and completeness of personally identifiable information across the information life cycle; Correcting or deleting inaccurate or outdated personally identifiable information; Disseminating notice of corrected or deleted personally identifiable information to individuals or other appropriate entities; and Appeals of adverse decisions on correction or deletion requests.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "227063d4-431e-435f-9e8f-009b6dbc20f4",
      "c15bfc12-a61e-4ca5-bf35-fa9ce3ccb5d2"
    ],
    "relatedControls": [
      "pm-23",
      "si-18"
    ]
  },
  {
    "id": "pm-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Data Governance Body",
    "description": "Establish a Data Governance Body consisting of [roles] with [responsibilities].",
    "priority": "P3",
    "references": [
      "511da9ca-604d-43f7-be41-b862085420a9",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "d886c141-c832-4ad7-ac6d-4b94f4b550d3",
      "c15bfc12-a61e-4ca5-bf35-fa9ce3ccb5d2"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "pm-19",
      "pm-22",
      "pm-24",
      "pt-7",
      "si-4",
      "si-19"
    ]
  },
  {
    "id": "pm-24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Data Integrity Board",
    "description": "Establish a Data Integrity Board to: Review proposals to conduct or participate in a matching program; and Conduct an annual review of all matching programs in which the agency has participated.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa"
    ],
    "relatedControls": [
      "ac-4",
      "pm-19",
      "pm-23",
      "pt-2",
      "pt-8"
    ]
  },
  {
    "id": "pm-25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Minimization of Personally Identifiable Information Used in Testing, Training, and Research",
    "description": "Develop, document, and implement policies and procedures that address the use of personally identifiable information for internal testing, training, and research; Limit or minimize the amount of personally identifiable information used for internal testing, training, and research purposes; Authorize the use of personally identifiable information when such information is required for internal testing, training, and research; and Review and update policies and procedures [organization-defined frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "pm-23",
      "pt-3",
      "sa-3",
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "pm-26",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Complaint Management",
    "description": "Implement a process for receiving and responding to complaints, concerns, or questions from individuals about the organizational security and privacy practices that includes: Mechanisms that are easy to use and readily accessible by the public; All information necessary for successfully filing complaints; Tracking mechanisms to ensure all complaints received are reviewed and addressed within [organization-defined time period]; Acknowledgement of receipt of complaints, concerns, or questions from individuals within [time period] ; and Response to complaints, concerns, or questions from individuals within [time period].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ir-7",
      "ir-9",
      "pm-22",
      "si-18"
    ]
  },
  {
    "id": "pm-27",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Privacy Reporting",
    "description": "Develop [privacy reports] and disseminate to: [oversight bodies] to demonstrate accountability with statutory, regulatory, and policy privacy mandates; and [officials] and other personnel with responsibility for monitoring privacy program compliance; and Review and update privacy reports [frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "0c67b2a9-bede-43d2-b86d-5f35b8be36e9",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa"
    ],
    "relatedControls": [
      "ir-9",
      "pm-19"
    ]
  },
  {
    "id": "pm-28",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Risk Framing",
    "description": "Identify and document: Assumptions affecting risk assessments, risk responses, and risk monitoring; Constraints affecting risk assessments, risk responses, and risk monitoring; Priorities and trade-offs considered by the organization for managing risk; and Organizational risk tolerance; Distribute the results of risk framing activities to [personnel] ; and Review and update risk framing considerations [frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2"
    ],
    "relatedControls": [
      "ca-7",
      "pm-9",
      "ra-3",
      "ra-7"
    ]
  },
  {
    "id": "pm-29",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Risk Management Program Leadership Roles",
    "description": "Appoint a Senior Accountable Official for Risk Management to align organizational information security and privacy management processes with strategic, operational, and budgetary planning processes; and Establish a Risk Executive (function) to view and analyze risk from an organization-wide perspective and ensure management of risk is consistent across the organization.",
    "priority": "P3",
    "references": [
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ],
    "relatedControls": [
      "pm-2",
      "pm-19"
    ]
  },
  {
    "id": "pm-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Information Security and Privacy Resources",
    "description": "Include the resources needed to implement the information security and privacy programs in capital planning and investment requests and document all exceptions to this requirement; Prepare documentation required for addressing information security and privacy programs in capital planning and investment requests in accordance with applicable laws, executive orders, directives, policies, regulations, standards; and Make available for expenditure, the planned information security and privacy resources.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "pm-4",
      "sa-2"
    ]
  },
  {
    "id": "pm-30",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Supply Chain Risk Management Strategy",
    "description": "Develop an organization-wide strategy for managing supply chain risks associated with the development, acquisition, maintenance, and disposal of systems, system components, and system services; Implement the supply chain risk management strategy consistently across the organization; and Review and update the supply chain risk management strategy on [frequency] or as required, to address organizational changes.",
    "priority": "P3",
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "206a3284-6a7e-423c-8ea9-25b22542541d",
      "031cc4b7-9adf-4835-98f1-f1ca493519cf",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "15a95e24-65b6-4686-bc18-90855a10457d",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "cm-10",
      "pm-9",
      "sr-1",
      "sr-2",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-6",
      "sr-7",
      "sr-8",
      "sr-9",
      "sr-11"
    ]
  },
  {
    "id": "pm-30.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pm-30",
    "family": "Program Management",
    "title": "Suppliers of Critical or Mission-essential Items",
    "description": "Identify, prioritize, and assess suppliers of critical or mission-essential technologies, products, and services.",
    "priority": "P3",
    "relatedControls": [
      "ra-3",
      "sr-6"
    ]
  },
  {
    "id": "pm-31",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Continuous Monitoring Strategy",
    "description": "Develop an organization-wide continuous monitoring strategy and implement continuous monitoring programs that include: Establishing the following organization-wide metrics to be monitored: [metrics]; Establishing [monitoring frequencies] and [assessment frequencies] for control effectiveness; Ongoing monitoring of organizationally-defined metrics in accordance with the continuous monitoring strategy; Correlation and analysis of information generated by control assessments and monitoring; Response actions to address results of the analysis of control assessment and monitoring information; and Reporting the security and privacy status of organizational systems to [organization-defined personnel or roles] [organization-defined frequency].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb",
      "62ea77ca-e450-4323-b210-e0d75390e785"
    ],
    "relatedControls": [
      "ac-2",
      "ac-6",
      "ac-17",
      "at-4",
      "au-6",
      "au-13",
      "ca-2",
      "ca-5",
      "ca-6",
      "ca-7",
      "cm-3",
      "cm-4",
      "cm-6",
      "cm-11",
      "ia-5",
      "ir-5",
      "ma-2",
      "ma-3",
      "ma-4",
      "pe-3",
      "pe-6",
      "pe-14",
      "pe-16",
      "pe-20",
      "pl-2",
      "pm-4",
      "pm-6",
      "pm-9",
      "pm-10",
      "pm-12",
      "pm-14",
      "pm-23",
      "pm-28",
      "ps-7",
      "pt-7",
      "ra-3",
      "ra-5",
      "ra-7",
      "sa-9",
      "sa-11",
      "sc-5",
      "sc-7",
      "sc-18",
      "sc-38",
      "sc-43",
      "si-3",
      "si-4",
      "si-12",
      "sr-2",
      "sr-4"
    ]
  },
  {
    "id": "pm-32",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Purposing",
    "description": "Analyze [systems or system components] supporting mission essential services or functions to ensure that the information resources are being used consistent with their intended purpose.",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "ca-7",
      "pl-2",
      "ra-3",
      "ra-9"
    ]
  },
  {
    "id": "pm-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Plan of Action and Milestones Process",
    "description": "Implement a process to ensure that plans of action and milestones for the information security, privacy, and supply chain risk management programs and associated organizational systems: Are developed and maintained; Document the remedial information security, privacy, and supply chain risk management actions to adequately respond to risk to organizational operations and assets, individuals, other organizations, and the Nation; and Are reported in accordance with established reporting requirements. Review plans of action and milestones for consistency with the organizational risk management strategy and organization-wide priorities for risk response actions.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8"
    ],
    "relatedControls": [
      "ca-5",
      "ca-7",
      "pm-3",
      "ra-7",
      "si-12"
    ]
  },
  {
    "id": "pm-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "System Inventory",
    "description": "Develop and update [frequency] an inventory of organizational systems.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "98d415ca-7281-4064-9931-0c366637e324"
    ]
  },
  {
    "id": "pm-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pm-5",
    "family": "Program Management",
    "title": "Inventory of Personally Identifiable Information",
    "description": "Establish, maintain, and update [frequency] an inventory of all systems, applications, and projects that process personally identifiable information.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "ac-3",
      "cm-8",
      "cm-12",
      "cm-13",
      "pl-8",
      "pm-22",
      "pt-3",
      "pt-5",
      "si-12",
      "si-18"
    ]
  },
  {
    "id": "pm-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Measures of Performance",
    "description": "Develop, monitor, and report on the results of information security and privacy measures of performance.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "7798067b-4ed0-4adc-a505-79dad4741693",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb"
    ],
    "relatedControls": [
      "ca-7",
      "pm-9"
    ]
  },
  {
    "id": "pm-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Enterprise Architecture",
    "description": "Develop and maintain an enterprise architecture with consideration for information security, privacy, and the resulting risk to organizational operations and assets, individuals, other organizations, and the Nation.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "au-6",
      "pl-2",
      "pl-8",
      "pm-11",
      "ra-2",
      "sa-3",
      "sa-8",
      "sa-17"
    ]
  },
  {
    "id": "pm-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pm-7",
    "family": "Program Management",
    "title": "Offloading",
    "description": "Offload [non-essential functions or services] to other systems, system components, or an external provider.",
    "priority": "P3",
    "relatedControls": [
      "sa-8"
    ]
  },
  {
    "id": "pm-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Critical Infrastructure Plan",
    "description": "Address information security and privacy issues in the development, documentation, and updating of a critical infrastructure and key resources protection plan.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "3406fdc0-d61c-44a9-a5ca-84180544c83a",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "488d6934-00b2-4252-bf23-1b3c2d71eb13",
      "b9951d04-6385-478c-b1a3-ab68c19d9041"
    ],
    "relatedControls": [
      "cp-2",
      "cp-4",
      "pe-18",
      "pl-2",
      "pm-9",
      "pm-11",
      "pm-18",
      "ra-3",
      "si-12"
    ]
  },
  {
    "id": "pm-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Program Management",
    "title": "Risk Management Strategy",
    "description": "Develops a comprehensive strategy to manage: Security risk to organizational operations and assets, individuals, other organizations, and the Nation associated with the operation and use of organizational systems; and Privacy risk to individuals resulting from the authorized processing of personally identifiable information; Implement the risk management strategy consistently across the organization; and Review and update the risk management strategy [frequency] or as required, to address organizational changes.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "ac-1",
      "au-1",
      "at-1",
      "ca-1",
      "ca-2",
      "ca-5",
      "ca-6",
      "ca-7",
      "cm-1",
      "cp-1",
      "ia-1",
      "ir-1",
      "ma-1",
      "mp-1",
      "pe-1",
      "pl-1",
      "pl-2",
      "pm-2",
      "pm-8",
      "pm-18",
      "pm-28",
      "pm-30",
      "ps-1",
      "pt-1",
      "pt-2",
      "pt-3",
      "ra-1",
      "ra-3",
      "ra-9",
      "sa-1",
      "sa-4",
      "sc-1",
      "sc-38",
      "si-1",
      "si-12",
      "sr-1",
      "sr-2"
    ]
  },
  {
    "id": "ps-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] personnel security policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the personnel security policy and the associated personnel security controls; Designate an [official] to manage the development, documentation, and dissemination of the personnel security policy and procedures; and Review and update the current personnel security: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ps-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Position Risk Designation",
    "description": "Assign a risk designation to all organizational positions; Establish screening criteria for individuals filling those positions; and Review and update position risk designations [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "a5ef5e56-5c1a-4911-b419-37dddc1b3581",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ],
    "relatedControls": [
      "ac-5",
      "at-3",
      "pe-2",
      "pe-3",
      "pl-2",
      "ps-3",
      "ps-6",
      "sa-5",
      "sa-21",
      "si-12"
    ]
  },
  {
    "id": "ps-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Personnel Screening",
    "description": "Screen individuals prior to authorizing access to the system; and Rescreen individuals in accordance with [organization-defined conditions requiring rescreening and, where rescreening is so indicated, the frequency of rescreening].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "55b0c93a-5e48-457a-baa6-5ce81c239c49",
      "0af071a6-cf8e-48ee-8c82-fe91efa20f94",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "7af2e6ec-9f7e-4232-ad3f-09888eb0793a",
      "828856bd-d7c4-427b-8b51-815517ec382d"
    ],
    "relatedControls": [
      "ac-2",
      "ia-4",
      "ma-5",
      "pe-2",
      "pm-12",
      "ps-2",
      "ps-6",
      "ps-7",
      "sa-21"
    ]
  },
  {
    "id": "ps-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-3",
    "family": "Personnel Security",
    "title": "Classified Information",
    "description": "Verify that individuals accessing a system processing, storing, or transmitting classified information are cleared and indoctrinated to the highest classification level of the information to which they have access on the system.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4"
    ]
  },
  {
    "id": "ps-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-3",
    "family": "Personnel Security",
    "title": "Formal Indoctrination",
    "description": "Verify that individuals accessing a system processing, storing, or transmitting types of classified information that require formal indoctrination, are formally indoctrinated for all the relevant types of information to which they have access on the system.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4"
    ]
  },
  {
    "id": "ps-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-3",
    "family": "Personnel Security",
    "title": "Information Requiring Special Protective Measures",
    "description": "Verify that individuals accessing a system processing, storing, or transmitting information requiring special protection: Have valid access authorizations that are demonstrated by assigned official government duties; and Satisfy [additional personnel screening criteria].",
    "priority": "P3"
  },
  {
    "id": "ps-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-3",
    "family": "Personnel Security",
    "title": "Citizenship Requirements",
    "description": "Verify that individuals accessing a system processing, storing, or transmitting [information types] meet [citizenship requirements].",
    "priority": "P3"
  },
  {
    "id": "ps-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Personnel Termination",
    "description": "Upon termination of individual employment: Disable system access within [time period]; Terminate or revoke any authenticators and credentials associated with the individual; Conduct exit interviews that include a discussion of [information security topics]; Retrieve all security-related organizational system-related property; and Retain access to organizational information and systems formerly controlled by terminated individual.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ia-4",
      "pe-2",
      "pm-12",
      "ps-6",
      "ps-7"
    ]
  },
  {
    "id": "ps-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-4",
    "family": "Personnel Security",
    "title": "Post-employment Requirements",
    "description": "Notify terminated individuals of applicable, legally binding post-employment requirements for the protection of organizational information; and Require terminated individuals to sign an acknowledgment of post-employment requirements as part of the organizational termination process.",
    "priority": "P3"
  },
  {
    "id": "ps-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-4",
    "family": "Personnel Security",
    "title": "Automated Actions",
    "description": "Use [automated mechanisms] to [choose: notify {{ insert: param, ps-04.02_odp.03 }} of individual termination actions, disable access to system resources].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "ps-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Personnel Transfer",
    "description": "Review and confirm ongoing operational need for current logical and physical access authorizations to systems and facilities when individuals are reassigned or transferred to other positions within the organization; Initiate [transfer or reassignment actions] within [time period following the formal transfer action]; Modify access authorization as needed to correspond with any changes in operational need due to reassignment or transfer; and Notify [personnel or roles] within [time period].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-2",
      "ia-4",
      "pe-2",
      "pm-12",
      "ps-4",
      "ps-7"
    ]
  },
  {
    "id": "ps-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Access Agreements",
    "description": "Develop and document access agreements for organizational systems; Review and update the access agreements [frequency] ; and Verify that individuals requiring access to organizational information and systems: Sign appropriate access agreements prior to being granted access; and Re-sign access agreements to maintain access to organizational systems when access agreements have been updated or [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "relatedControls": [
      "ac-17",
      "pe-2",
      "pl-4",
      "ps-2",
      "ps-3",
      "ps-6",
      "ps-7",
      "ps-8",
      "sa-21",
      "si-12"
    ]
  },
  {
    "id": "ps-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-6",
    "family": "Personnel Security",
    "title": "Information Requiring Special Protection",
    "description": "Information Requiring Special Protection",
    "priority": "P3"
  },
  {
    "id": "ps-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-6",
    "family": "Personnel Security",
    "title": "Classified Information Requiring Special Protection",
    "description": "Verify that access to classified information requiring special protection is granted only to individuals who: Have a valid access authorization that is demonstrated by assigned official government duties; Satisfy associated personnel security criteria; and Have read, understood, and signed a nondisclosure agreement.",
    "priority": "P3"
  },
  {
    "id": "ps-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ps-6",
    "family": "Personnel Security",
    "title": "Post-employment Requirements",
    "description": "Notify individuals of applicable, legally binding post-employment requirements for protection of organizational information; and Require individuals to sign an acknowledgment of these requirements, if applicable, as part of granting initial access to covered information.",
    "priority": "P3",
    "relatedControls": [
      "ps-4"
    ]
  },
  {
    "id": "ps-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "External Personnel Security",
    "description": "Establish personnel security requirements, including security roles and responsibilities for external providers; Require external providers to comply with personnel security policies and procedures established by the organization; Document personnel security requirements; Require external providers to notify [personnel or roles] of any personnel transfers or terminations of external personnel who possess organizational credentials and/or badges, or who have system privileges within [time period] ; and Monitor provider compliance with personnel security requirements.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "77faf0bc-c394-44ad-9154-bbac3b79c8ad",
      "737513fa-6758-403f-831d-5ddab5e23cb3"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "ma-5",
      "pe-3",
      "ps-2",
      "ps-3",
      "ps-4",
      "ps-5",
      "ps-6",
      "sa-5",
      "sa-9",
      "sa-21"
    ]
  },
  {
    "id": "ps-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Personnel Sanctions",
    "description": "Employ a formal sanctions process for individuals failing to comply with established information security and privacy policies and procedures; and Notify [personnel or roles] within [time period] when a formal employee sanctions process is initiated, identifying the individual sanctioned and the reason for the sanction.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "pl-4",
      "pm-12",
      "ps-6",
      "pt-1"
    ]
  },
  {
    "id": "ps-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personnel Security",
    "title": "Position Descriptions",
    "description": "Incorporate security and privacy roles and responsibilities into organizational position descriptions.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f"
    ]
  },
  {
    "id": "pt-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] personally identifiable information processing and transparency policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the personally identifiable information processing and transparency policy and the associated personally identifiable information processing and transparency controls; Designate an [official] to manage the development, documentation, and dissemination of the personally identifiable information processing and transparency policy and procedures; and Review and update the current personally identifiable information processing and transparency: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ]
  },
  {
    "id": "pt-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Authority to Process Personally Identifiable Information",
    "description": "Determine and document the [authority] that permits the [processing] of personally identifiable information; and Restrict the [processing] of personally identifiable information to only that which is authorized.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "a2590922-82f3-4277-83c0-ca5bee06dba4"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "cm-13",
      "ir-9",
      "pm-9",
      "pm-24",
      "pt-1",
      "pt-3",
      "pt-5",
      "pt-6",
      "ra-3",
      "ra-8",
      "si-12",
      "si-18"
    ]
  },
  {
    "id": "pt-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-2",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Data Tagging",
    "description": "Attach data tags containing [authorized processing] to [elements of personally identifiable information].",
    "priority": "P3",
    "relatedControls": [
      "ac-16",
      "ca-6",
      "cm-12",
      "pm-5",
      "pm-22",
      "pt-4",
      "sc-16",
      "sc-43",
      "si-10",
      "si-15",
      "si-19"
    ]
  },
  {
    "id": "pt-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-2",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Automation",
    "description": "Manage enforcement of the authorized processing of personally identifiable information using [automated mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "ca-6",
      "cm-12",
      "pm-5",
      "pm-22",
      "pt-4",
      "sc-16",
      "sc-43",
      "si-10",
      "si-15",
      "si-19"
    ]
  },
  {
    "id": "pt-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Personally Identifiable Information Processing Purposes",
    "description": "Identify and document the [purpose(s)] for processing personally identifiable information; Describe the purpose(s) in the public privacy notices and policies of the organization; Restrict the [processing] of personally identifiable information to only that which is compatible with the identified purpose(s); and Monitor changes in processing personally identifiable information and implement [mechanisms] to ensure that any changes are made in accordance with [requirements].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "a2590922-82f3-4277-83c0-ca5bee06dba4"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "at-3",
      "cm-13",
      "ir-9",
      "pm-9",
      "pm-25",
      "pt-2",
      "pt-5",
      "pt-6",
      "pt-7",
      "ra-8",
      "sc-43",
      "si-12",
      "si-18"
    ]
  },
  {
    "id": "pt-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-3",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Data Tagging",
    "description": "Attach data tags containing the following purposes to [elements of personally identifiable information]: [processing purposes].",
    "priority": "P3",
    "relatedControls": [
      "ca-6",
      "cm-12",
      "pm-5",
      "pm-22",
      "sc-16",
      "sc-43",
      "si-10",
      "si-15",
      "si-19"
    ]
  },
  {
    "id": "pt-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-3",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Automation",
    "description": "Track processing purposes of personally identifiable information using [automated mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "ca-6",
      "cm-12",
      "pm-5",
      "pm-22",
      "sc-16",
      "sc-43",
      "si-10",
      "si-15",
      "si-19"
    ]
  },
  {
    "id": "pt-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Consent",
    "description": "Implement [tools or mechanisms] for individuals to consent to the processing of their personally identifiable information prior to its collection that facilitate individuals’ informed decision-making.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "737513fa-6758-403f-831d-5ddab5e23cb3"
    ],
    "relatedControls": [
      "ac-16",
      "pt-2",
      "pt-5"
    ]
  },
  {
    "id": "pt-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-4",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Tailored Consent",
    "description": "Provide [mechanisms] to allow individuals to tailor processing permissions to selected elements of personally identifiable information.",
    "priority": "P3",
    "relatedControls": [
      "pt-2"
    ]
  },
  {
    "id": "pt-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-4",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Just-in-time Consent",
    "description": "Present [consent mechanisms] to individuals at [frequency] and in conjunction with [personally identifiable information processing].",
    "priority": "P3",
    "relatedControls": [
      "pt-2"
    ]
  },
  {
    "id": "pt-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-4",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Revocation",
    "description": "Implement [tools or mechanisms] for individuals to revoke consent to the processing of their personally identifiable information.",
    "priority": "P3",
    "relatedControls": [
      "pt-2"
    ]
  },
  {
    "id": "pt-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Privacy Notice",
    "description": "Provide notice to individuals about the processing of personally identifiable information that: Is available to individuals upon first interacting with an organization, and subsequently at [frequency]; Is clear and easy-to-understand, expressing information about personally identifiable information processing in plain language; Identifies the authority that authorizes the processing of personally identifiable information; Identifies the purposes for which personally identifiable information is to be processed; and Includes [information].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa"
    ],
    "relatedControls": [
      "pm-20",
      "pm-22",
      "pt-2",
      "pt-3",
      "pt-4",
      "pt-7",
      "ra-3",
      "sc-42",
      "si-18"
    ]
  },
  {
    "id": "pt-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-5",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Just-in-time Notice",
    "description": "Present notice of personally identifiable information processing to individuals at a time and location where the individual provides personally identifiable information or in conjunction with a data action, or [frequency].",
    "priority": "P3",
    "relatedControls": [
      "pm-21"
    ]
  },
  {
    "id": "pt-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-5",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Privacy Act Statements",
    "description": "Include Privacy Act statements on forms that collect information that will be maintained in a Privacy Act system of records, or provide Privacy Act statements on separate forms that can be retained by individuals.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pt-6"
    ]
  },
  {
    "id": "pt-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "System of Records Notice",
    "description": "For systems that process information that will be maintained in a Privacy Act system of records: Draft system of records notices in accordance with OMB guidance and submit new and significantly modified system of records notices to the OMB and appropriate congressional committees for advance review; Publish system of records notices in the Federal Register; and Keep system of records notices accurate, up-to-date, and scoped in accordance with policy.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa"
    ],
    "relatedControls": [
      "ac-3",
      "pm-20",
      "pt-2",
      "pt-3",
      "pt-5"
    ]
  },
  {
    "id": "pt-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-6",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Routine Uses",
    "description": "Review all routine uses published in the system of records notice at [frequency] to ensure continued accuracy, and to ensure that routine uses continue to be compatible with the purpose for which the information was collected.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "pt-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-6",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Exemption Rules",
    "description": "Review all Privacy Act exemptions claimed for the system of records at [frequency] to ensure they remain appropriate and necessary in accordance with law, that they have been promulgated as regulations, and that they are accurately described in the system of records notice.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "pt-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Specific Categories of Personally Identifiable Information",
    "description": "Apply [processing conditions] for specific categories of personally identifiable information.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa",
      "c28ae9a8-1121-42a9-a85e-00cfcc9b9a94"
    ],
    "relatedControls": [
      "ir-9",
      "pt-2",
      "pt-3",
      "ra-3"
    ]
  },
  {
    "id": "pt-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-7",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Social Security Numbers",
    "description": "When a system processes Social Security numbers: Eliminate unnecessary collection, maintenance, and use of Social Security numbers, and explore alternatives to their use as a personal identifier; Do not deny any individual any right, benefit, or privilege provided by law because of such individual’s refusal to disclose his or her Social Security number; and Inform any individual who is asked to disclose his or her Social Security number whether that disclosure is mandatory or voluntary, by what statutory or other authority such number is solicited, and what uses will be made of it.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "ia-4"
    ]
  },
  {
    "id": "pt-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "pt-7",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "First Amendment Information",
    "description": "Prohibit the processing of information describing how any individual exercises rights guaranteed by the First Amendment unless expressly authorized by statute or by the individual or unless pertinent to and within the scope of an authorized law enforcement activity.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "pt-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Personally Identifiable Information Processing and Transparency",
    "title": "Computer Matching Requirements",
    "description": "When a system or organization processes information for the purpose of conducting a matching program: Obtain approval from the Data Integrity Board to conduct the matching program; Develop and enter into a computer matching agreement; Publish a matching notice in the Federal Register; Independently verify the information produced by the matching program before taking adverse action against an individual, if required; and Provide individuals with notice and an opportunity to contest the findings before taking adverse action against an individual.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "94c64e1a-456c-457f-86da-83ac0dfc85ac",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "3671ff20-c17c-44d6-8a88-7de203fa74aa"
    ],
    "relatedControls": [
      "pm-24"
    ]
  },
  {
    "id": "ra-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] risk assessment policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the risk assessment policy and the associated risk assessment controls; Designate an [official] to manage the development, documentation, and dissemination of the risk assessment policy and procedures; and Review and update the current risk assessment: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "ra-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Threat Hunting",
    "description": "Establish and maintain a cyber threat hunting capability to: Search for indicators of compromise in organizational systems; and Detect, track, and disrupt threats that evade existing controls; and Employ the threat hunting capability [frequency].",
    "priority": "P3",
    "references": [
      "08b07465-dbdc-48d6-8a0b-37279602ac16"
    ],
    "relatedControls": [
      "ca-2",
      "ca-7",
      "ca-8",
      "ra-3",
      "ra-5",
      "ra-6",
      "si-4"
    ]
  },
  {
    "id": "ra-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Security Categorization",
    "description": "Categorize the system and information it processes, stores, and transmits; Document the security categorization results, including supporting rationale, in the security plan for the system; and Verify that the authorizing official or authorizing official designated representative reviews and approves the security categorization decision.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "599fb53d-5041-444e-a7fe-640d6d30ad05",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "4e4fbc93-333d-45e6-a875-de36b878b6b9",
      "c28ae9a8-1121-42a9-a85e-00cfcc9b9a94"
    ],
    "relatedControls": [
      "cm-8",
      "mp-4",
      "pl-2",
      "pl-10",
      "pl-11",
      "pm-7",
      "ra-3",
      "ra-5",
      "ra-7",
      "ra-8",
      "sa-8",
      "sc-7",
      "sc-38",
      "si-12"
    ]
  },
  {
    "id": "ra-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-2",
    "family": "Risk Assessment",
    "title": "Impact-level Prioritization",
    "description": "Conduct an impact-level prioritization of organizational systems to obtain additional granularity on system impact levels.",
    "priority": "P3"
  },
  {
    "id": "ra-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Risk Assessment",
    "description": "Conduct a risk assessment, including: Identifying threats to and vulnerabilities in the system; Determining the likelihood and magnitude of harm from unauthorized access, use, disclosure, disruption, modification, or destruction of the system, the information it processes, stores, or transmits, and any related information; and Determining the likelihood and impact of adverse effects on individuals arising from the processing of personally identifiable information; Integrate risk assessment results and risk management decisions from the organization and mission or business process perspectives with system-level risk assessments; Document risk assessment results in [choose: security and privacy plans, risk assessment report, {{ insert: param, ra-03_odp.02 }} ]; Review risk assessment results [frequency]; Disseminate risk assessment results to [personnel or roles] ; and Update the risk assessment [frequency] or when there are significant changes to the system, its environment of operation, or other conditions that may impact the security or privacy state of the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327",
      "98d415ca-7281-4064-9931-0c366637e324",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "ca-3",
      "ca-6",
      "cm-4",
      "cm-13",
      "cp-6",
      "cp-7",
      "ia-8",
      "ma-5",
      "pe-3",
      "pe-8",
      "pe-18",
      "pl-2",
      "pl-10",
      "pl-11",
      "pm-8",
      "pm-9",
      "pm-28",
      "pt-2",
      "pt-7",
      "ra-2",
      "ra-5",
      "ra-7",
      "sa-8",
      "sa-9",
      "sc-38",
      "si-12"
    ]
  },
  {
    "id": "ra-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-3",
    "family": "Risk Assessment",
    "title": "Supply Chain Risk Assessment",
    "description": "Assess supply chain risks associated with [systems, system components, and system services] ; and Update the supply chain risk assessment [frequency] , when there are significant changes to the relevant supply chain, or when changes to the system, environments of operation, or other conditions may necessitate a change in the supply chain.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ra-2",
      "ra-9",
      "pm-17",
      "pm-30",
      "sr-2"
    ]
  },
  {
    "id": "ra-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-3",
    "family": "Risk Assessment",
    "title": "Use of All-source Intelligence",
    "description": "Use all-source intelligence to assist in the analysis of risk.",
    "priority": "P3"
  },
  {
    "id": "ra-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-3",
    "family": "Risk Assessment",
    "title": "Dynamic Threat Awareness",
    "description": "Determine the current cyber threat environment on an ongoing basis using [means].",
    "priority": "P3",
    "relatedControls": [
      "at-2"
    ]
  },
  {
    "id": "ra-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-3",
    "family": "Risk Assessment",
    "title": "Predictive Cyber Analytics",
    "description": "Employ the following advanced automation and analytics capabilities to predict and identify risks to [systems or system components]: [organization-defined advanced automation and analytics capabilities].",
    "priority": "P3"
  },
  {
    "id": "ra-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Risk Assessment Update",
    "description": "Risk Assessment Update",
    "priority": "P3"
  },
  {
    "id": "ra-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Vulnerability Monitoring and Scanning",
    "description": "Monitor and scan for vulnerabilities in the system and hosted applications [organization-defined frequency and/or randomly in accordance with organization-defined process] and when new vulnerabilities potentially affecting the system are identified and reported; Employ vulnerability monitoring tools and techniques that facilitate interoperability among tools and automate parts of the vulnerability management process by using standards for: Enumerating platforms, software flaws, and improper configurations; Formatting checklists and test procedures; and Measuring vulnerability impact; Analyze vulnerability scan reports and results from vulnerability monitoring; Remediate legitimate vulnerabilities [response times] in accordance with an organizational assessment of risk; Share information obtained from the vulnerability monitoring process and control assessments with [personnel or roles] to help eliminate similar vulnerabilities in other systems; and Employ vulnerability monitoring tools that include the capability to readily update the vulnerabilities to be scanned.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "8df72805-2e5c-4731-a73e-81db0f0318d0",
      "155f941a-cba9-4afd-9ca6-5d040d697ba9",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "4895b4cd-34c5-4667-bf8a-27d443c12047",
      "122177fa-c4ed-485d-8345-3082c0fb9a06",
      "8016d2ed-d30f-4416-9c45-0f42c7aa3232",
      "aa5d04e0-6090-4e17-84d4-b9963d55fc2c",
      "d2ebec9b-f868-4ee1-a2bd-0b2282aed248",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "ca-2",
      "ca-7",
      "ca-8",
      "cm-2",
      "cm-4",
      "cm-6",
      "cm-8",
      "ra-2",
      "ra-3",
      "sa-11",
      "sa-15",
      "sc-38",
      "si-2",
      "si-3",
      "si-4",
      "si-7",
      "sr-11"
    ]
  },
  {
    "id": "ra-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Update Tool Capability",
    "description": "Update Tool Capability",
    "priority": "P3"
  },
  {
    "id": "ra-5.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Correlate Scanning Information",
    "description": "Correlate the output from vulnerability scanning tools to determine the presence of multi-vulnerability and multi-hop attack vectors.",
    "priority": "P3"
  },
  {
    "id": "ra-5.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Public Disclosure Program",
    "description": "Establish a public reporting channel for receiving reports of vulnerabilities in organizational systems and system components.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "ra-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Update Vulnerabilities to Be Scanned",
    "description": "Update the system vulnerabilities to be scanned [choose: {{ insert: param, ra-05.02_odp.02 }} , prior to a new scan, when new vulnerabilities are identified and reported].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "si-5"
    ]
  },
  {
    "id": "ra-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Breadth and Depth of Coverage",
    "description": "Define the breadth and depth of vulnerability scanning coverage.",
    "priority": "P3"
  },
  {
    "id": "ra-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Discoverable Information",
    "description": "Determine information about the system that is discoverable and take [corrective actions].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "au-13",
      "sc-26"
    ]
  },
  {
    "id": "ra-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Privileged Access",
    "description": "Implement privileged access authorization to [system components] for [vulnerability scanning activities].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "ra-5.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Automated Trend Analyses",
    "description": "Compare the results of multiple vulnerability scans using [automated mechanisms].",
    "priority": "P3"
  },
  {
    "id": "ra-5.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Automated Detection and Notification of Unauthorized Components",
    "description": "Automated Detection and Notification of Unauthorized Components",
    "priority": "P3"
  },
  {
    "id": "ra-5.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Review Historic Audit Logs",
    "description": "Review historic audit logs to determine if a vulnerability identified in a [system] has been previously exploited within an [time period].",
    "priority": "P3",
    "relatedControls": [
      "au-6",
      "au-11"
    ]
  },
  {
    "id": "ra-5.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "ra-5",
    "family": "Risk Assessment",
    "title": "Penetration Testing and Analyses",
    "description": "Penetration Testing and Analyses",
    "priority": "P3"
  },
  {
    "id": "ra-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Technical Surveillance Countermeasures Survey",
    "description": "Employ a technical surveillance countermeasures survey at [locations] [choose: {{ insert: param, ra-06_odp.03 }} , when {{ insert: param, ra-06_odp.04 }} ].",
    "priority": "P3"
  },
  {
    "id": "ra-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Risk Response",
    "description": "Respond to findings from security and privacy assessments, monitoring, and audits in accordance with organizational risk tolerance.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "599fb53d-5041-444e-a7fe-640d6d30ad05",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ca-5",
      "ir-9",
      "pm-4",
      "pm-28",
      "ra-2",
      "ra-3",
      "sr-2"
    ]
  },
  {
    "id": "ra-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Privacy Impact Assessments",
    "description": "Conduct privacy impact assessments for systems, programs, or other activities before: Developing or procuring information technology that processes personally identifiable information; and Initiating a new collection of personally identifiable information that: Will be processed using information technology; and Includes personally identifiable information permitting the physical or virtual (online) contacting of a specific individual, if identical questions have been posed to, or identical reporting requirements imposed on, ten or more individuals, other than agencies, instrumentalities, or employees of the federal government.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "7b0b9634-741a-4335-b6fa-161228c3a76e",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "d229ae60-51dd-4d7b-a8bf-1f7195cc7561"
    ],
    "relatedControls": [
      "cm-4",
      "cm-9",
      "cm-13",
      "pt-2",
      "pt-3",
      "pt-5",
      "ra-1",
      "ra-2",
      "ra-3",
      "ra-7"
    ]
  },
  {
    "id": "ra-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Risk Assessment",
    "title": "Criticality Analysis",
    "description": "Identify critical system components and functions by performing a criticality analysis for [systems, system components, or system services] at [decision points in the system development life cycle].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "d4296805-2dca-4c63-a95f-eeccaa826aec"
    ],
    "relatedControls": [
      "cp-2",
      "pl-2",
      "pl-8",
      "pl-11",
      "pm-1",
      "pm-11",
      "ra-2",
      "sa-8",
      "sa-15",
      "sa-20",
      "sr-5"
    ]
  },
  {
    "id": "sa-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] system and services acquisition policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the system and services acquisition policy and the associated system and services acquisition controls; Designate an [official] to manage the development, documentation, and dissemination of the system and services acquisition policy and procedures; and Review and update the current system and services acquisition: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "sa-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Developer Configuration Management",
    "description": "Require the developer of the system, system component, or system service to: Perform configuration management during system, component, or service [choose: design, development, implementation, operation, disposal]; Document, manage, and control the integrity of changes to [configuration items]; Implement only organization-approved changes to the system, component, or service; Document approved changes to the system, component, or service and the potential security and privacy impacts of such changes; and Track security flaws and flaw resolution within the system, component, or service and report findings to [personnel].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "cm-2",
      "cm-3",
      "cm-4",
      "cm-7",
      "cm-9",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-15",
      "si-2",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-6"
    ]
  },
  {
    "id": "sa-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Software and Firmware Integrity Verification",
    "description": "Require the developer of the system, system component, or system service to enable integrity verification of software and firmware components.",
    "priority": "P3",
    "relatedControls": [
      "si-7",
      "sr-11"
    ]
  },
  {
    "id": "sa-10.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Alternative Configuration Management Processes",
    "description": "Provide an alternate configuration management process using organizational personnel in the absence of a dedicated developer configuration management team.",
    "priority": "P3"
  },
  {
    "id": "sa-10.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Hardware Integrity Verification",
    "description": "Require the developer of the system, system component, or system service to enable integrity verification of hardware components.",
    "priority": "P3",
    "relatedControls": [
      "si-7"
    ]
  },
  {
    "id": "sa-10.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Trusted Generation",
    "description": "Require the developer of the system, system component, or system service to employ tools for comparing newly generated versions of security-relevant hardware descriptions, source code, and object code with previous versions.",
    "priority": "P3"
  },
  {
    "id": "sa-10.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Mapping Integrity for Version Control",
    "description": "Require the developer of the system, system component, or system service to maintain the integrity of the mapping between the master build data describing the current version of security-relevant hardware, software, and firmware and the on-site master copy of the data for the current version.",
    "priority": "P3"
  },
  {
    "id": "sa-10.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Trusted Distribution",
    "description": "Require the developer of the system, system component, or system service to execute procedures for ensuring that security-relevant hardware, software, and firmware updates distributed to the organization are exactly as specified by the master copies.",
    "priority": "P3"
  },
  {
    "id": "sa-10.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-10",
    "family": "System and Services Acquisition",
    "title": "Security and Privacy Representatives",
    "description": "Require [organization-defined security and privacy representatives] to be included in the [organization-defined configuration change management and control process].",
    "priority": "P3"
  },
  {
    "id": "sa-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Developer Testing and Evaluation",
    "description": "Require the developer of the system, system component, or system service, at all post-design stages of the system development life cycle, to: Develop and implement a plan for ongoing security and privacy control assessments; Perform [choose: unit, integration, system, regression] testing/evaluation [frequency to conduct] at [depth and coverage]; Produce evidence of the execution of the assessment plan and the results of the testing and evaluation; Implement a verifiable flaw remediation process; and Correct flaws identified during testing and evaluation.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate",
      "privacy"
    ],
    "references": [
      "4452efc0-e79e-47b8-aa30-b54f3ef61c2f",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "708b94e1-3d5e-4b22-ab43-1c69f3a97e37",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ca-2",
      "ca-7",
      "cm-4",
      "sa-3",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-15",
      "sa-17",
      "si-2",
      "sr-5",
      "sr-6",
      "sr-7"
    ]
  },
  {
    "id": "sa-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Static Code Analysis",
    "description": "Require the developer of the system, system component, or system service to employ static code analysis tools to identify common flaws and document the results of the analysis.",
    "priority": "P3"
  },
  {
    "id": "sa-11.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Threat Modeling and Vulnerability Analyses",
    "description": "Require the developer of the system, system component, or system service to perform threat modeling and vulnerability analyses during development and the subsequent testing and evaluation of the system, component, or service that: Uses the following contextual information: [information]; Employs the following tools and methods: [tools and methods]; Conducts the modeling and analyses at the following level of rigor: [organization-defined breadth and depth of modeling and analyses] ; and Produces evidence that meets the following acceptance criteria: [organization-defined acceptance criteria].",
    "priority": "P3",
    "relatedControls": [
      "pm-15",
      "ra-3",
      "ra-5"
    ]
  },
  {
    "id": "sa-11.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Independent Verification of Assessment Plans and Evidence",
    "description": "Require an independent agent satisfying [independence criteria] to verify the correct implementation of the developer security and privacy assessment plans and the evidence produced during testing and evaluation; and Verify that the independent agent is provided with sufficient information to complete the verification process or granted the authority to obtain such information.",
    "priority": "P3",
    "relatedControls": [
      "at-3",
      "ra-5"
    ]
  },
  {
    "id": "sa-11.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Manual Code Reviews",
    "description": "Require the developer of the system, system component, or system service to perform a manual code review of [specific code] using the following processes, procedures, and/or techniques: [processes, procedures, and/or techniques].",
    "priority": "P3"
  },
  {
    "id": "sa-11.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Penetration Testing",
    "description": "Require the developer of the system, system component, or system service to perform penetration testing: At the following level of rigor: [organization-defined breadth and depth of testing] ; and Under the following constraints: [constraints].",
    "priority": "P3",
    "relatedControls": [
      "ca-8",
      "pm-14",
      "pm-25",
      "pt-2",
      "sa-3",
      "si-2",
      "si-6"
    ]
  },
  {
    "id": "sa-11.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Attack Surface Reviews",
    "description": "Require the developer of the system, system component, or system service to perform attack surface reviews.",
    "priority": "P3",
    "relatedControls": [
      "sa-15"
    ]
  },
  {
    "id": "sa-11.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Verify Scope of Testing and Evaluation",
    "description": "Require the developer of the system, system component, or system service to verify that the scope of testing and evaluation provides complete coverage of the required controls at the following level of rigor: [organization-defined breadth and depth of testing and evaluation].",
    "priority": "P3",
    "relatedControls": [
      "sa-15"
    ]
  },
  {
    "id": "sa-11.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Dynamic Code Analysis",
    "description": "Require the developer of the system, system component, or system service to employ dynamic code analysis tools to identify common flaws and document the results of the analysis.",
    "priority": "P3"
  },
  {
    "id": "sa-11.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-11",
    "family": "System and Services Acquisition",
    "title": "Interactive Application Security Testing",
    "description": "Require the developer of the system, system component, or system service to employ interactive application security testing tools to identify flaws and document the results.",
    "priority": "P3"
  },
  {
    "id": "sa-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Supply Chain Protection",
    "description": "Supply Chain Protection",
    "priority": "P3"
  },
  {
    "id": "sa-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Acquisition Strategies / Tools / Methods",
    "description": "Acquisition Strategies / Tools / Methods",
    "priority": "P3"
  },
  {
    "id": "sa-12.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Validate as Genuine and Not Altered",
    "description": "Validate as Genuine and Not Altered",
    "priority": "P3"
  },
  {
    "id": "sa-12.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Penetration Testing / Analysis of Elements, Processes, and Actors",
    "description": "Penetration Testing / Analysis of Elements, Processes, and Actors",
    "priority": "P3"
  },
  {
    "id": "sa-12.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Inter-organizational Agreements",
    "description": "Inter-organizational Agreements",
    "priority": "P3"
  },
  {
    "id": "sa-12.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Critical Information System Components",
    "description": "Critical Information System Components",
    "priority": "P3"
  },
  {
    "id": "sa-12.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Identity and Traceability",
    "description": "Identity and Traceability",
    "priority": "P3"
  },
  {
    "id": "sa-12.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Processes to Address Weaknesses or Deficiencies",
    "description": "Processes to Address Weaknesses or Deficiencies",
    "priority": "P3"
  },
  {
    "id": "sa-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Supplier Reviews",
    "description": "Supplier Reviews",
    "priority": "P3"
  },
  {
    "id": "sa-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Trusted Shipping and Warehousing",
    "description": "Trusted Shipping and Warehousing",
    "priority": "P3"
  },
  {
    "id": "sa-12.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Diversity of Suppliers",
    "description": "Diversity of Suppliers",
    "priority": "P3"
  },
  {
    "id": "sa-12.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Limitation of Harm",
    "description": "Limitation of Harm",
    "priority": "P3"
  },
  {
    "id": "sa-12.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Minimizing Procurement Time",
    "description": "Minimizing Procurement Time",
    "priority": "P3"
  },
  {
    "id": "sa-12.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Assessments Prior to Selection / Acceptance / Update",
    "description": "Assessments Prior to Selection / Acceptance / Update",
    "priority": "P3"
  },
  {
    "id": "sa-12.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Use of All-source Intelligence",
    "description": "Use of All-source Intelligence",
    "priority": "P3"
  },
  {
    "id": "sa-12.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-12",
    "family": "System and Services Acquisition",
    "title": "Operations Security",
    "description": "Operations Security",
    "priority": "P3"
  },
  {
    "id": "sa-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Trustworthiness",
    "description": "Trustworthiness",
    "priority": "P3"
  },
  {
    "id": "sa-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Criticality Analysis",
    "description": "Criticality Analysis",
    "priority": "P3"
  },
  {
    "id": "sa-14.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-14",
    "family": "System and Services Acquisition",
    "title": "Critical Components with No Viable Alternative Sourcing",
    "description": "Critical Components with No Viable Alternative Sourcing",
    "priority": "P3"
  },
  {
    "id": "sa-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Development Process, Standards, and Tools",
    "description": "Require the developer of the system, system component, or system service to follow a documented development process that: Explicitly addresses security and privacy requirements; Identifies the standards and tools used in the development process; Documents the specific tool options and tool configurations used in the development process; and Documents, manages, and ensures the integrity of changes to the process and/or tools used in development; and Review the development process, standards, tools, tool options, and tool configurations [frequency] to determine if the process, standards, tools, tool options and tool configurations selected and employed can satisfy the following security and privacy requirements: [organization-defined security and privacy requirements].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "d4296805-2dca-4c63-a95f-eeccaa826aec"
    ],
    "relatedControls": [
      "ma-6",
      "sa-3",
      "sa-4",
      "sa-8",
      "sa-10",
      "sa-11",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-6",
      "sr-9"
    ]
  },
  {
    "id": "sa-15.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Quality Metrics",
    "description": "Require the developer of the system, system component, or system service to: Define quality metrics at the beginning of the development process; and Provide evidence of meeting the quality metrics [choose: {{ insert: param, sa-15.01_odp.02 }} , {{ insert: param, sa-15.01_odp.03 }} , upon delivery].",
    "priority": "P3"
  },
  {
    "id": "sa-15.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Incident Response Plan",
    "description": "Require the developer of the system, system component, or system service to provide, implement, and test an incident response plan.",
    "priority": "P3",
    "relatedControls": [
      "ir-8"
    ]
  },
  {
    "id": "sa-15.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Archive System or Component",
    "description": "Require the developer of the system or system component to archive the system or component to be released or delivered together with the corresponding evidence supporting the final security and privacy review.",
    "priority": "P3",
    "relatedControls": [
      "cm-2"
    ]
  },
  {
    "id": "sa-15.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Minimize Personally Identifiable Information",
    "description": "Require the developer of the system or system component to minimize the use of personally identifiable information in development and test environments.",
    "priority": "P3",
    "relatedControls": [
      "pm-25",
      "sa-3",
      "sa-8"
    ]
  },
  {
    "id": "sa-15.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Logging Syntax",
    "description": "Require the developer of the system or system component to minimize the use of personally identifiable information in development and test environments.",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-3",
      "ir-4",
      "ir-8",
      "sa-5"
    ]
  },
  {
    "id": "sa-15.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Security and Privacy Tracking Tools",
    "description": "Require the developer of the system, system component, or system service to select and employ security and privacy tracking tools for use during the development process.",
    "priority": "P3",
    "relatedControls": [
      "sa-11"
    ]
  },
  {
    "id": "sa-15.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Criticality Analysis",
    "description": "Require the developer of the system, system component, or system service to perform a criticality analysis: At the following decision points in the system development life cycle: [decision points] ; and At the following level of rigor: [organization-defined breadth and depth of criticality analysis].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ra-9"
    ]
  },
  {
    "id": "sa-15.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Threat Modeling and Vulnerability Analysis",
    "description": "Threat Modeling and Vulnerability Analysis",
    "priority": "P3"
  },
  {
    "id": "sa-15.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Attack Surface Reduction",
    "description": "Require the developer of the system, system component, or system service to reduce attack surfaces to [thresholds].",
    "priority": "P3",
    "relatedControls": [
      "ac-6",
      "cm-7",
      "ra-3",
      "sa-11"
    ]
  },
  {
    "id": "sa-15.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Continuous Improvement",
    "description": "Require the developer of the system, system component, or system service to implement an explicit process to continuously improve the development process.",
    "priority": "P3"
  },
  {
    "id": "sa-15.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Automated Vulnerability Analysis",
    "description": "Require the developer of the system, system component, or system service [frequency] to: Perform an automated vulnerability analysis using [tools]; Determine the exploitation potential for discovered vulnerabilities; Determine potential risk mitigations for delivered vulnerabilities; and Deliver the outputs of the tools and results of the analysis to [personnel or roles].",
    "priority": "P3",
    "relatedControls": [
      "ra-5",
      "sa-11"
    ]
  },
  {
    "id": "sa-15.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Reuse of Threat and Vulnerability Information",
    "description": "Require the developer of the system, system component, or system service to use threat modeling and vulnerability analyses from similar systems, components, or services to inform the current development process.",
    "priority": "P3"
  },
  {
    "id": "sa-15.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-15",
    "family": "System and Services Acquisition",
    "title": "Use of Live Data",
    "description": "Use of Live Data",
    "priority": "P3"
  },
  {
    "id": "sa-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Developer-provided Training",
    "description": "Require the developer of the system, system component, or system service to provide the following training on the correct use and operation of the implemented security and privacy functions, controls, and/or mechanisms: [training].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "at-2",
      "at-3",
      "pe-3",
      "sa-4",
      "sa-5"
    ]
  },
  {
    "id": "sa-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Developer Security and Privacy Architecture and Design",
    "description": "Require the developer of the system, system component, or system service to produce a design specification and security and privacy architecture that: Is consistent with the organization’s security and privacy architecture that is an integral part the organization’s enterprise architecture; Accurately and completely describes the required security and privacy functionality, and the allocation of controls among physical and logical components; and Expresses how individual security and privacy functions, mechanisms, and services work together to provide required security and privacy capabilities and a unified approach to protection.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "references": [
      "87087451-2af5-43d4-88c1-d66ad850f614",
      "4452efc0-e79e-47b8-aa30-b54f3ef61c2f",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "pl-2",
      "pl-8",
      "pm-7",
      "sa-3",
      "sa-4",
      "sa-8",
      "sc-7"
    ]
  },
  {
    "id": "sa-17.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Formal Policy Model",
    "description": "Require the developer of the system, system component, or system service to: Produce, as an integral part of the development process, a formal policy model describing the [organization-defined elements of organizational security and privacy policy] to be enforced; and Prove that the formal policy model is internally consistent and sufficient to enforce the defined elements of the organizational security and privacy policy when implemented.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-25"
    ]
  },
  {
    "id": "sa-17.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Security-relevant Components",
    "description": "Require the developer of the system, system component, or system service to: Define security-relevant hardware, software, and firmware; and Provide a rationale that the definition for security-relevant hardware, software, and firmware is complete.",
    "priority": "P3",
    "relatedControls": [
      "ac-25",
      "sa-5"
    ]
  },
  {
    "id": "sa-17.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Formal Correspondence",
    "description": "Require the developer of the system, system component, or system service to: Produce, as an integral part of the development process, a formal top-level specification that specifies the interfaces to security-relevant hardware, software, and firmware in terms of exceptions, error messages, and effects; Show via proof to the extent feasible with additional informal demonstration as necessary, that the formal top-level specification is consistent with the formal policy model; Show via informal demonstration, that the formal top-level specification completely covers the interfaces to security-relevant hardware, software, and firmware; Show that the formal top-level specification is an accurate description of the implemented security-relevant hardware, software, and firmware; and Describe the security-relevant hardware, software, and firmware mechanisms not addressed in the formal top-level specification but strictly internal to the security-relevant hardware, software, and firmware.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-25",
      "sa-4",
      "sa-5"
    ]
  },
  {
    "id": "sa-17.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Informal Correspondence",
    "description": "Require the developer of the system, system component, or system service to: Produce, as an integral part of the development process, an informal descriptive top-level specification that specifies the interfaces to security-relevant hardware, software, and firmware in terms of exceptions, error messages, and effects; Show via [choose: informal demonstration, convincing argument with formal methods as feasible] that the descriptive top-level specification is consistent with the formal policy model; Show via informal demonstration, that the descriptive top-level specification completely covers the interfaces to security-relevant hardware, software, and firmware; Show that the descriptive top-level specification is an accurate description of the interfaces to security-relevant hardware, software, and firmware; and Describe the security-relevant hardware, software, and firmware mechanisms not addressed in the descriptive top-level specification but strictly internal to the security-relevant hardware, software, and firmware.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-25",
      "sa-4",
      "sa-5"
    ]
  },
  {
    "id": "sa-17.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Conceptually Simple Design",
    "description": "Require the developer of the system, system component, or system service to: Design and structure the security-relevant hardware, software, and firmware to use a complete, conceptually simple protection mechanism with precisely defined semantics; and Internally structure the security-relevant hardware, software, and firmware with specific regard for this mechanism.",
    "priority": "P3",
    "relatedControls": [
      "ac-25",
      "sa-8",
      "sc-3"
    ]
  },
  {
    "id": "sa-17.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Structure for Testing",
    "description": "Require the developer of the system, system component, or system service to structure security-relevant hardware, software, and firmware to facilitate testing.",
    "priority": "P3",
    "relatedControls": [
      "sa-5",
      "sa-11"
    ]
  },
  {
    "id": "sa-17.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Structure for Least Privilege",
    "description": "Require the developer of the system, system component, or system service to structure security-relevant hardware, software, and firmware to facilitate controlling access with least privilege.",
    "priority": "P3",
    "relatedControls": [
      "ac-5",
      "ac-6",
      "sa-8"
    ]
  },
  {
    "id": "sa-17.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Orchestration",
    "description": "Design [critical systems] with coordinated behavior to implement the following capabilities: [capabilities].",
    "priority": "P3"
  },
  {
    "id": "sa-17.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-17",
    "family": "System and Services Acquisition",
    "title": "Design Diversity",
    "description": "Use different designs for [critical systems] to satisfy a common set of requirements or to provide equivalent functionality.",
    "priority": "P3"
  },
  {
    "id": "sa-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Tamper Resistance and Detection",
    "description": "Tamper Resistance and Detection",
    "priority": "P3"
  },
  {
    "id": "sa-18.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-18",
    "family": "System and Services Acquisition",
    "title": "Multiple Phases of System Development Life Cycle",
    "description": "Multiple Phases of System Development Life Cycle",
    "priority": "P3"
  },
  {
    "id": "sa-18.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-18",
    "family": "System and Services Acquisition",
    "title": "Inspection of Systems or Components",
    "description": "Inspection of Systems or Components",
    "priority": "P3"
  },
  {
    "id": "sa-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Component Authenticity",
    "description": "Component Authenticity",
    "priority": "P3"
  },
  {
    "id": "sa-19.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-19",
    "family": "System and Services Acquisition",
    "title": "Anti-counterfeit Training",
    "description": "Anti-counterfeit Training",
    "priority": "P3"
  },
  {
    "id": "sa-19.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-19",
    "family": "System and Services Acquisition",
    "title": "Configuration Control for Component Service and Repair",
    "description": "Configuration Control for Component Service and Repair",
    "priority": "P3"
  },
  {
    "id": "sa-19.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-19",
    "family": "System and Services Acquisition",
    "title": "Component Disposal",
    "description": "Component Disposal",
    "priority": "P3"
  },
  {
    "id": "sa-19.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-19",
    "family": "System and Services Acquisition",
    "title": "Anti-counterfeit Scanning",
    "description": "Anti-counterfeit Scanning",
    "priority": "P3"
  },
  {
    "id": "sa-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Allocation of Resources",
    "description": "Determine the high-level information security and privacy requirements for the system or system service in mission and business process planning; Determine, document, and allocate the resources required to protect the system or system service as part of the organizational capital planning and investment control process; and Establish a discrete line item for information security and privacy in organizational programming and budgeting documentation.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "pl-7",
      "pm-3",
      "pm-11",
      "sa-9",
      "sr-3",
      "sr-5"
    ]
  },
  {
    "id": "sa-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Customized Development of Critical Components",
    "description": "Reimplement or custom develop the following critical system components: [critical system].",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "cp-2",
      "ra-9",
      "sa-8"
    ]
  },
  {
    "id": "sa-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Developer Screening",
    "description": "Require that the developer of [system, systems component, or system service]: Has appropriate access authorizations as determined by assigned [official government duties] ; and Satisfies the following additional personnel screening criteria: [additional personnel screening criteria].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ps-2",
      "ps-3",
      "ps-6",
      "ps-7",
      "sa-4",
      "sr-6"
    ]
  },
  {
    "id": "sa-21.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-21",
    "family": "System and Services Acquisition",
    "title": "Validation of Screening",
    "description": "Validation of Screening",
    "priority": "P3"
  },
  {
    "id": "sa-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Unsupported System Components",
    "description": "Replace system components when support for the components is no longer available from the developer, vendor, or manufacturer; or Provide the following options for alternative sources for continued support for unsupported components [choose: in-house support, {{ insert: param, sa-22_odp.02 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "pl-2",
      "sa-3"
    ]
  },
  {
    "id": "sa-22.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-22",
    "family": "System and Services Acquisition",
    "title": "Alternative Sources for Continued Support",
    "description": "Alternative Sources for Continued Support",
    "priority": "P3"
  },
  {
    "id": "sa-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Specialization",
    "description": "Employ [choose: design modification, augmentation, reconfiguration] on [systems or system components] supporting mission essential services or functions to increase the trustworthiness in those systems or components.",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "ra-9",
      "sa-8"
    ]
  },
  {
    "id": "sa-24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Design For Cyber Resiliency",
    "description": "Design organizational systems, system components, or system services to achieve cyber resiliency by: Defining the following cyber resiliency goals: [cyber resiliency goals]. Defining the following cyber resiliency objectives: [cyber resiliency objectives]. Defining the following cyber resiliency techniques: [cyber resiliency techniques]. Defining the following cyber resiliency implementation approaches: [cyber resiliency implementation approaches]. Defining the following cyber resiliency design principles: [cyber resiliency design principles]. Implement the selected cyber resiliency goals, objectives, techniques, implementation approaches, and design principles as part of an organizational risk management process or systems security engineering process.",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "ca-7",
      "cp-2",
      "cp-4",
      "cp-9",
      "cp-10",
      "cp-11",
      "cp-12",
      "cp-13",
      "ia-10",
      "ir-4",
      "ir-5",
      "pe-11",
      "pe-17",
      "pl-8",
      "pm-7",
      "pm-16",
      "pm-30",
      "pm-31",
      "ra-3",
      "ra-5",
      "ra-9",
      "ra-10",
      "sa-3",
      "sa-8",
      "sa-9",
      "sa-17",
      "sc-3",
      "sc-5",
      "sc-7",
      "sc-10",
      "sc-11",
      "sc-29",
      "sc-30",
      "sc-34",
      "sc-35",
      "sc-36",
      "sc-37",
      "sc-39",
      "sc-44",
      "sc-47",
      "sc-48",
      "sc-49",
      "sc-50",
      "sc-51",
      "si-3",
      "si-4",
      "si-6",
      "si-7",
      "si-10",
      "si-14",
      "si-15",
      "si-16",
      "si-19",
      "si-20",
      "si-21",
      "si-22",
      "si-23",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-6",
      "sr-7",
      "sr-9",
      "sr-10",
      "sr-11"
    ]
  },
  {
    "id": "sa-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "System Development Life Cycle",
    "description": "Acquire, develop, and manage the system using [system-development life cycle] that incorporates information security and privacy considerations; Define and document information security and privacy roles and responsibilities throughout the system development life cycle; Identify individuals having information security and privacy roles and responsibilities; and Integrate the organizational information security and privacy risk management process into system development life cycle activities.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "7dbd6d9f-29d6-4d1d-9766-f2d77ff3c849",
      "f26af0d0-6d72-4a9d-8ecd-01bc21fd4f0e"
    ],
    "relatedControls": [
      "at-3",
      "pl-8",
      "pm-7",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-11",
      "sa-15",
      "sa-17",
      "sa-22",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-9"
    ]
  },
  {
    "id": "sa-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-3",
    "family": "System and Services Acquisition",
    "title": "Manage Preproduction Environment",
    "description": "Protect system preproduction environments commensurate with risk throughout the system development life cycle for the system, system component, or system service.",
    "priority": "P3",
    "relatedControls": [
      "cm-2",
      "cm-4",
      "ra-3",
      "ra-9",
      "sa-4"
    ]
  },
  {
    "id": "sa-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-3",
    "family": "System and Services Acquisition",
    "title": "Use of Live or Operational Data",
    "description": "Approve, document, and control the use of live data in preproduction environments for the system, system component, or system service; and Protect preproduction environments for the system, system component, or system service at the same impact or classification level as any live data in use within the preproduction environments.",
    "priority": "P3",
    "relatedControls": [
      "pm-25",
      "ra-3"
    ]
  },
  {
    "id": "sa-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-3",
    "family": "System and Services Acquisition",
    "title": "Technology Refresh",
    "description": "Plan for and implement a technology refresh schedule for the system throughout the system development life cycle.",
    "priority": "P3",
    "relatedControls": [
      "ma-6"
    ]
  },
  {
    "id": "sa-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Acquisition Process",
    "description": "Include the following requirements, descriptions, and criteria, explicitly or by reference, using [choose: standardized contract language, {{ insert: param, sa-04_odp.02 }} ] in the acquisition contract for the system, system component, or system service: Security and privacy functional requirements; Strength of mechanism requirements; Security and privacy assurance requirements; Controls needed to satisfy the security and privacy requirements. Security and privacy documentation requirements; Requirements for protecting security and privacy documentation; Description of the system development environment and environment in which the system is intended to operate; Allocation of responsibility or identification of parties responsible for information security, privacy, and supply chain risk management; and Acceptance criteria.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "6afc1b04-c9d6-4023-adbc-f8fbe33a3c73",
      "87087451-2af5-43d4-88c1-d66ad850f614",
      "4452efc0-e79e-47b8-aa30-b54f3ef61c2f",
      "06ce9216-bd54-4054-a422-94f358b50a5d",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7ba1d91c-3934-4d5a-8532-b32f864ad34c",
      "77faf0bc-c394-44ad-9154-bbac3b79c8ad",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "4895b4cd-34c5-4667-bf8a-27d443c12047",
      "858705be-3c1f-48aa-a328-0ce398d95ef0",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "15dc76ff-b17a-4eeb-8948-8ea8de3ccc2c",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba",
      "4b38e961-1125-4a5b-aa35-1d6c02846dad",
      "604774da-9e1d-48eb-9c62-4e959dc80737",
      "98d415ca-7281-4064-9931-0c366637e324",
      "795aff72-3e6c-4b6b-a80a-b14d84b7f544",
      "3d575737-98cb-459d-b41c-d7e82b73ad78"
    ],
    "relatedControls": [
      "cm-6",
      "cm-8",
      "ps-7",
      "sa-3",
      "sa-5",
      "sa-8",
      "sa-11",
      "sa-15",
      "sa-16",
      "sa-17",
      "sa-21",
      "sr-3",
      "sr-5"
    ]
  },
  {
    "id": "sa-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Functional Properties of Controls",
    "description": "Require the developer of the system, system component, or system service to provide a description of the functional properties of the controls to be implemented.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "sa-4.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Use of Approved PIV Products",
    "description": "Employ only information technology products on the FIPS 201-approved products list for Personal Identity Verification (PIV) capability implemented within organizational systems.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ia-2",
      "ia-8",
      "pm-9"
    ]
  },
  {
    "id": "sa-4.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "System of Records",
    "description": "Include [Privacy Act requirements] in the acquisition contract for the operation of a system of records on behalf of an organization to accomplish an organizational mission or function.",
    "priority": "P3",
    "relatedControls": [
      "pt-6"
    ]
  },
  {
    "id": "sa-4.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Data Ownership",
    "description": "Include organizational data ownership requirements in the acquisition contract; and Require all data to be removed from the contractor’s system and returned to the organization within [time frame].",
    "priority": "P3"
  },
  {
    "id": "sa-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Design and Implementation Information for Controls",
    "description": "Require the developer of the system, system component, or system service to provide design and implementation information for the controls that includes: [choose: security-relevant external system interfaces, high-level design, low-level design, source code or hardware schematics, {{ insert: param, sa-04.02_odp.02 }} ] at [level of detail].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "sa-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Development Methods, Techniques, and Practices",
    "description": "Require the developer of the system, system component, or system service to demonstrate the use of a system development life cycle process that includes: [systems engineering methods]; [choose: {{ insert: param, sa-04.03_odp.03 }} , {{ insert: param, sa-04.03_odp.04 }} ] ; and [choose: {{ insert: param, sa-04.03_odp.06 }} , {{ insert: param, sa-04.03_odp.07 }} , {{ insert: param, sa-04.03_odp.08 }} ].",
    "priority": "P3"
  },
  {
    "id": "sa-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Assignment of Components to Systems",
    "description": "Assignment of Components to Systems",
    "priority": "P3"
  },
  {
    "id": "sa-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "System, Component, and Service Configurations",
    "description": "Require the developer of the system, system component, or system service to: Deliver the system, component, or service with [security configurations] implemented; and Use the configurations as the default for any subsequent system, component, or service reinstallation or upgrade.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "sa-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Use of Information Assurance Products",
    "description": "Employ only government off-the-shelf or commercial off-the-shelf information assurance and information assurance-enabled information technology products that compose an NSA-approved solution to protect classified information when the networks used to transmit the information are at a lower classification level than the information being transmitted; and Ensure that these products have been evaluated and/or validated by NSA or in accordance with NSA-approved procedures.",
    "priority": "P3",
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sa-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "NIAP-approved Protection Profiles ",
    "description": "Limit the use of commercially provided information assurance and information assurance-enabled information technology products to those products that have been successfully evaluated against a National Information Assurance partnership (NIAP)-approved Protection Profile for a specific technology type, if such a profile exists; and Require, if no NIAP-approved Protection Profile exists for a specific technology type but a commercially provided information technology product relies on cryptographic functionality to enforce its security policy, that the cryptographic module is FIPS-validated or NSA-approved.",
    "priority": "P3",
    "relatedControls": [
      "ia-7",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sa-4.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Continuous Monitoring Plan for Controls",
    "description": "Require the developer of the system, system component, or system service to produce a plan for continuous monitoring of control effectiveness that is consistent with the continuous monitoring program of the organization.",
    "priority": "P3",
    "relatedControls": [
      "ca-7"
    ]
  },
  {
    "id": "sa-4.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-4",
    "family": "System and Services Acquisition",
    "title": "Functions, Ports, Protocols, and Services in Use",
    "description": "Require the developer of the system, system component, or system service to identify the functions, ports, protocols, and services intended for organizational use.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-7",
      "sa-9"
    ]
  },
  {
    "id": "sa-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "System Documentation",
    "description": "Obtain or develop administrator documentation for the system, system component, or system service that describes: Secure configuration, installation, and operation of the system, component, or service; Effective use and maintenance of security and privacy functions and mechanisms; and Known vulnerabilities regarding configuration and use of administrative or privileged functions; Obtain or develop user documentation for the system, system component, or system service that describes: User-accessible security and privacy functions and mechanisms and how to effectively use those functions and mechanisms; Methods for user interaction, which enables individuals to use the system, component, or service in a more secure manner and protect individual privacy; and User responsibilities in maintaining the security of the system, component, or service and privacy of individuals; Document attempts to obtain system, system component, or system service documentation when such documentation is either unavailable or nonexistent and take [actions] in response; and Distribute documentation to [personnel or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "cm-4",
      "cm-6",
      "cm-7",
      "cm-8",
      "pl-2",
      "pl-4",
      "pl-8",
      "ps-2",
      "sa-3",
      "sa-4",
      "sa-8",
      "sa-9",
      "sa-10",
      "sa-11",
      "sa-15",
      "sa-16",
      "sa-17",
      "si-12",
      "sr-3"
    ]
  },
  {
    "id": "sa-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-5",
    "family": "System and Services Acquisition",
    "title": "Functional Properties of Security Controls",
    "description": "Functional Properties of Security Controls",
    "priority": "P3"
  },
  {
    "id": "sa-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-5",
    "family": "System and Services Acquisition",
    "title": "Security-relevant External System Interfaces",
    "description": "Security-relevant External System Interfaces",
    "priority": "P3"
  },
  {
    "id": "sa-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-5",
    "family": "System and Services Acquisition",
    "title": "High-level Design",
    "description": "High-level Design",
    "priority": "P3"
  },
  {
    "id": "sa-5.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-5",
    "family": "System and Services Acquisition",
    "title": "Low-level Design",
    "description": "Low-level Design",
    "priority": "P3"
  },
  {
    "id": "sa-5.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-5",
    "family": "System and Services Acquisition",
    "title": "Source Code",
    "description": "Source Code",
    "priority": "P3"
  },
  {
    "id": "sa-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Software Usage Restrictions",
    "description": "Software Usage Restrictions",
    "priority": "P3"
  },
  {
    "id": "sa-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "User-installed Software",
    "description": "User-installed Software",
    "priority": "P3"
  },
  {
    "id": "sa-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "Security and Privacy Engineering Principles",
    "description": "Apply the following systems security and privacy engineering principles in the specification, design, development, implementation, and modification of the system and system components: [organization-defined systems security and privacy engineering principles].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "18e71fec-c6fd-475a-925a-5d8495cf8455",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "599fb53d-5041-444e-a7fe-640d6d30ad05",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "a21aef46-7330-48a0-b2e1-c5bb8b2dd11d",
      "e72fde0b-6fc2-497e-a9db-d8fce5a11b8a",
      "9be5d661-421f-41ad-854e-86f98b811891",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "98d415ca-7281-4064-9931-0c366637e324",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "pl-8",
      "pm-7",
      "ra-2",
      "ra-3",
      "ra-9",
      "sa-3",
      "sa-4",
      "sa-15",
      "sa-17",
      "sa-20",
      "sc-2",
      "sc-3",
      "sc-32",
      "sc-39",
      "sr-2",
      "sr-3",
      "sr-4",
      "sr-5"
    ]
  },
  {
    "id": "sa-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Clear Abstractions",
    "description": "Implement the security design principle of clear abstractions.",
    "priority": "P3"
  },
  {
    "id": "sa-8.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Hierarchical Trust",
    "description": "Implement the security design principle of hierarchical trust in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Inverse Modification Threshold",
    "description": "Implement the security design principle of inverse modification threshold in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Hierarchical Protection",
    "description": "Implement the security design principle of hierarchical protection in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Minimized Security Elements",
    "description": "Implement the security design principle of minimized security elements in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Least Privilege",
    "description": "Implement the security design principle of least privilege in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-6",
      "cm-7"
    ]
  },
  {
    "id": "sa-8.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Predicate Permission",
    "description": "Implement the security design principle of predicate permission in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-5"
    ]
  },
  {
    "id": "sa-8.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Self-reliant Trustworthiness",
    "description": "Implement the security design principle of self-reliant trustworthiness in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure Distributed Composition",
    "description": "Implement the security design principle of secure distributed composition in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Trusted Communications Channels",
    "description": "Implement the security design principle of trusted communications channels in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "sc-8",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sa-8.19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Continuous Protection",
    "description": "Implement the security design principle of continuous protection in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-25"
    ]
  },
  {
    "id": "sa-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Least Common Mechanism",
    "description": "Implement the security design principle of least common mechanism in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure Metadata Management",
    "description": "Implement the security design principle of secure metadata management in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Self-analysis",
    "description": "Implement the security design principle of self-analysis in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ca-7"
    ]
  },
  {
    "id": "sa-8.22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Accountability and Traceability",
    "description": "Implement the security design principle of accountability and traceability in [organization-defined systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-6",
      "au-2",
      "au-3",
      "au-6",
      "au-9",
      "au-10",
      "au-12",
      "ia-2",
      "ir-4"
    ]
  },
  {
    "id": "sa-8.23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure Defaults",
    "description": "Implement the security design principle of secure defaults in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cm-2",
      "cm-6",
      "sa-4"
    ]
  },
  {
    "id": "sa-8.24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure Failure and Recovery",
    "description": "Implement the security design principle of secure failure and recovery in [organization-defined systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cp-10",
      "cp-12",
      "sc-7",
      "sc-8",
      "sc-24",
      "si-13"
    ]
  },
  {
    "id": "sa-8.25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Economic Security",
    "description": "Implement the security design principle of economic security in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "sa-8.26",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Performance Security",
    "description": "Implement the security design principle of performance security in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13",
      "si-2",
      "si-7"
    ]
  },
  {
    "id": "sa-8.27",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Human Factored Security",
    "description": "Implement the security design principle of human factored security in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.28",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Acceptable Security",
    "description": "Implement the security design principle of acceptable security in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.29",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Repeatable and Documented Procedures",
    "description": "Implement the security design principle of repeatable and documented procedures in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cm-1",
      "sa-1",
      "sa-10",
      "sa-11",
      "sa-15",
      "sa-17",
      "sc-1",
      "si-1"
    ]
  },
  {
    "id": "sa-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Modularity and Layering",
    "description": "Implement the security design principles of modularity and layering in [organization-defined systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "sc-2",
      "sc-3"
    ]
  },
  {
    "id": "sa-8.30",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Procedural Rigor",
    "description": "Implement the security design principle of procedural rigor in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.31",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure System Modification",
    "description": "Implement the security design principle of secure system modification in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cm-3",
      "cm-4"
    ]
  },
  {
    "id": "sa-8.32",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Sufficient Documentation",
    "description": "Implement the security design principle of sufficient documentation in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "at-2",
      "at-3",
      "sa-5"
    ]
  },
  {
    "id": "sa-8.33",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Minimization",
    "description": "Implement the privacy principle of minimization using [processes].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pe-8",
      "pm-25",
      "sc-42",
      "si-12"
    ]
  },
  {
    "id": "sa-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Partially Ordered Dependencies",
    "description": "Implement the security design principle of partially ordered dependencies in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Efficiently Mediated Access",
    "description": "Implement the security design principle of efficiently mediated access in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-25"
    ]
  },
  {
    "id": "sa-8.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Minimized Sharing",
    "description": "Implement the security design principle of minimized sharing in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "sc-31"
    ]
  },
  {
    "id": "sa-8.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Reduced Complexity",
    "description": "Implement the security design principle of reduced complexity in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-8.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Secure Evolvability",
    "description": "Implement the security design principle of secure evolvability in [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cm-3"
    ]
  },
  {
    "id": "sa-8.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-8",
    "family": "System and Services Acquisition",
    "title": "Trusted Components",
    "description": "Implement the security design principle of trusted components in [systems or system components].",
    "priority": "P3"
  },
  {
    "id": "sa-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Services Acquisition",
    "title": "External System Services",
    "description": "Require that providers of external system services comply with organizational security and privacy requirements and employ the following controls: [controls]; Define and document organizational oversight and user roles and responsibilities with regard to external system services; and Employ the following processes, methods, and techniques to monitor control compliance by external service providers on an ongoing basis: [processes, methods, and techniques].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "77faf0bc-c394-44ad-9154-bbac3b79c8ad",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "7dbd6d9f-29d6-4d1d-9766-f2d77ff3c849"
    ],
    "relatedControls": [
      "ac-20",
      "ca-3",
      "cp-2",
      "ir-4",
      "ir-7",
      "pl-10",
      "pl-11",
      "ps-7",
      "sa-2",
      "sa-4",
      "sr-3",
      "sr-5"
    ]
  },
  {
    "id": "sa-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Risk Assessments and Organizational Approvals",
    "description": "Conduct an organizational assessment of risk prior to the acquisition or outsourcing of information security services; and Verify that the acquisition or outsourcing of dedicated information security services is approved by [personnel or roles].",
    "priority": "P3",
    "relatedControls": [
      "ca-6",
      "ra-3",
      "ra-8"
    ]
  },
  {
    "id": "sa-9.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Identification of Functions, Ports, Protocols, and Services",
    "description": "Require providers of the following external system services to identify the functions, ports, protocols, and other services required for the use of such services: [external system services].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "cm-6",
      "cm-7"
    ]
  },
  {
    "id": "sa-9.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Establish and Maintain Trust Relationship with Providers",
    "description": "Establish, document, and maintain trust relationships with external service providers based on the following requirements, properties, factors, or conditions: [organization-defined security and privacy requirements, properties, factors, or conditions defining acceptable trust relationships].",
    "priority": "P3",
    "relatedControls": [
      "sr-2"
    ]
  },
  {
    "id": "sa-9.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Consistent Interests of Consumers and Providers",
    "description": "Take the following actions to verify that the interests of [external service providers] are consistent with and reflect organizational interests: [actions].",
    "priority": "P3"
  },
  {
    "id": "sa-9.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Processing, Storage, and Service Location",
    "description": "Restrict the location of [choose: information processing, information or data, system services] to [locations] based on [requirements].",
    "priority": "P3",
    "relatedControls": [
      "sa-5",
      "sr-4"
    ]
  },
  {
    "id": "sa-9.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Organization-controlled Cryptographic Keys",
    "description": "Maintain exclusive control of cryptographic keys for encrypted material stored or transmitted through an external system.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13",
      "si-4"
    ]
  },
  {
    "id": "sa-9.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Organization-controlled Integrity Checking",
    "description": "Provide the capability to check the integrity of information while it resides in the external system.",
    "priority": "P3",
    "relatedControls": [
      "si-7"
    ]
  },
  {
    "id": "sa-9.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sa-9",
    "family": "System and Services Acquisition",
    "title": "Processing and Storage Location — U.S. Jurisdiction",
    "description": "Restrict the geographic location of information processing and data storage to facilities located within in the legal jurisdictional boundary of the United States.",
    "priority": "P3",
    "relatedControls": [
      "sa-5",
      "sr-4"
    ]
  },
  {
    "id": "sc-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business-process-level, system-level] system and communications protection policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the system and communications protection policy and the associated system and communications protection controls; Designate an [official] to manage the development, documentation, and dissemination of the system and communications protection policy and procedures; and Review and update the current system and communications protection: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "sc-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Network Disconnect",
    "description": "Terminate the network connection associated with a communications session at the end of the session or after [time period] of inactivity.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-17",
      "sc-23"
    ]
  },
  {
    "id": "sc-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Trusted Path",
    "description": "Provide a [choose: physically, logically] isolated trusted communications path for communications between the user and the trusted components of the system; and Permit users to invoke the trusted communications path for communications between the user and the following security functions of the system, including at a minimum, authentication and re-authentication: [security functions].",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ac-16",
      "ac-25",
      "sc-12",
      "sc-23"
    ]
  },
  {
    "id": "sc-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-11",
    "family": "System and Communications Protection",
    "title": "Irrefutable Communications Path",
    "description": "Provide a trusted communications path that is irrefutably distinguishable from other communications paths; and Initiate the trusted communications path for communications between the [security functions] of the system and the user.",
    "priority": "P3"
  },
  {
    "id": "sc-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Cryptographic Key Establishment and Management",
    "description": "Establish and manage cryptographic keys when cryptography is employed within the system in accordance with the following key management requirements: [requirements].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "20957dbb-6a1e-40a2-b38a-66f67d33ac2e",
      "0d083d8a-5cc6-46f1-8d79-3081d42bcb75",
      "eef62b16-c796-4554-955c-505824135b8a",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "737513fa-6758-403f-831d-5ddab5e23cb3",
      "849b2358-683f-4d97-b111-1cc3d522ded5",
      "3915a084-b87b-4f02-83d4-c369e746292f"
    ],
    "relatedControls": [
      "ac-17",
      "au-9",
      "au-10",
      "cm-3",
      "ia-3",
      "ia-7",
      "ia-13",
      "sa-4",
      "sa-8",
      "sa-9",
      "sc-8",
      "sc-11",
      "sc-13",
      "sc-17",
      "sc-20",
      "sc-37",
      "sc-40",
      "si-3",
      "si-7"
    ]
  },
  {
    "id": "sc-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "Availability",
    "description": "Maintain availability of information in the event of the loss of cryptographic keys by users.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "sc-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "Symmetric Keys",
    "description": "Produce, control, and distribute symmetric cryptographic keys using [choose: NIST FIPS-validated, NSA-approved] key management technology and processes.",
    "priority": "P3"
  },
  {
    "id": "sc-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "Asymmetric Keys",
    "description": "Produce, control, and distribute asymmetric cryptographic keys using [choose: NSA-approved key management technology and processes, prepositioned keying material, DoD-approved or DoD-issued Medium Assurance PKI certificates, DoD-approved or DoD-issued Medium Hardware Assurance PKI certificates and hardware security tokens that protect the user’s private key, certificates issued in accordance with organization-defined requirements].",
    "priority": "P3"
  },
  {
    "id": "sc-12.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "PKI Certificates",
    "description": "PKI Certificates",
    "priority": "P3"
  },
  {
    "id": "sc-12.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "PKI Certificates / Hardware Tokens",
    "description": "PKI Certificates / Hardware Tokens",
    "priority": "P3"
  },
  {
    "id": "sc-12.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-12",
    "family": "System and Communications Protection",
    "title": "Physical Control of Keys",
    "description": "Maintain physical control of cryptographic keys when stored information is encrypted by external service providers.",
    "priority": "P3"
  },
  {
    "id": "sc-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Cryptographic Protection",
    "description": "Determine the [cryptographic uses] ; and Implement the following types of cryptography required for each specified cryptographic use: [types of cryptography].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-7",
      "ac-17",
      "ac-18",
      "ac-19",
      "au-9",
      "au-10",
      "cm-11",
      "cp-9",
      "ia-3",
      "ia-5",
      "ia-7",
      "ia-13",
      "ma-4",
      "mp-2",
      "mp-4",
      "mp-5",
      "sa-4",
      "sa-8",
      "sa-9",
      "sc-8",
      "sc-12",
      "sc-20",
      "sc-23",
      "sc-28",
      "sc-40",
      "si-3",
      "si-7"
    ]
  },
  {
    "id": "sc-13.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-13",
    "family": "System and Communications Protection",
    "title": "FIPS-validated Cryptography",
    "description": "FIPS-validated Cryptography",
    "priority": "P3"
  },
  {
    "id": "sc-13.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-13",
    "family": "System and Communications Protection",
    "title": "NSA-approved Cryptography",
    "description": "NSA-approved Cryptography",
    "priority": "P3"
  },
  {
    "id": "sc-13.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-13",
    "family": "System and Communications Protection",
    "title": "Individuals Without Formal Access Approvals",
    "description": "Individuals Without Formal Access Approvals",
    "priority": "P3"
  },
  {
    "id": "sc-13.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-13",
    "family": "System and Communications Protection",
    "title": "Digital Signatures",
    "description": "Digital Signatures",
    "priority": "P3"
  },
  {
    "id": "sc-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Public Access Protections",
    "description": "Public Access Protections",
    "priority": "P3"
  },
  {
    "id": "sc-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Collaborative Computing Devices and Applications",
    "description": "Prohibit remote activation of collaborative computing devices and applications with the following exceptions: [exceptions where remote activation is to be allowed] ; and Provide an explicit indication of use to users physically present at the devices.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "ac-21",
      "sc-42"
    ]
  },
  {
    "id": "sc-15.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-15",
    "family": "System and Communications Protection",
    "title": "Physical or Logical Disconnect",
    "description": "Provide [choose: physical, logical] disconnect of collaborative computing devices in a manner that supports ease of use.",
    "priority": "P3"
  },
  {
    "id": "sc-15.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-15",
    "family": "System and Communications Protection",
    "title": "Blocking Inbound and Outbound Communications Traffic",
    "description": "Blocking Inbound and Outbound Communications Traffic",
    "priority": "P3"
  },
  {
    "id": "sc-15.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-15",
    "family": "System and Communications Protection",
    "title": "Disabling and Removal in Secure Work Areas",
    "description": "Disable or remove collaborative computing devices and applications from [systems or system components] in [secure work areas].",
    "priority": "P3"
  },
  {
    "id": "sc-15.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-15",
    "family": "System and Communications Protection",
    "title": "Explicitly Indicate Current Participants",
    "description": "Provide an explicit indication of current participants in [online meetings and teleconferences].",
    "priority": "P3"
  },
  {
    "id": "sc-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Transmission of Security and Privacy Attributes",
    "description": "Associate [organization-defined security and privacy attributes] with information exchanged between systems and between system components.",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-16"
    ]
  },
  {
    "id": "sc-16.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-16",
    "family": "System and Communications Protection",
    "title": "Integrity Verification",
    "description": "Verify the integrity of transmitted security and privacy attributes.",
    "priority": "P3",
    "relatedControls": [
      "au-10",
      "sc-8"
    ]
  },
  {
    "id": "sc-16.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-16",
    "family": "System and Communications Protection",
    "title": "Anti-spoofing Mechanisms",
    "description": "Implement anti-spoofing mechanisms to prevent adversaries from falsifying the security attributes indicating the successful application of the security process.",
    "priority": "P3",
    "relatedControls": [
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "sc-16.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-16",
    "family": "System and Communications Protection",
    "title": "Cryptographic Binding",
    "description": "Implement [mechanisms or techniques] to bind security and privacy attributes to transmitted information.",
    "priority": "P3",
    "relatedControls": [
      "ac-16",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Public Key Infrastructure Certificates",
    "description": "Issue public key certificates under an [certificate policy] or obtain public key certificates from an approved service provider; and Include only approved trust anchors in trust stores or certificate stores managed by the organization.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "8cb338a4-e493-4177-818f-3af18983ddc5",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "737513fa-6758-403f-831d-5ddab5e23cb3"
    ],
    "relatedControls": [
      "au-10",
      "ia-5",
      "sc-12"
    ]
  },
  {
    "id": "sc-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Mobile Code",
    "description": "Define acceptable and unacceptable mobile code and mobile code technologies; and Authorize, monitor, and control the use of mobile code within the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "f641309f-a3ad-48be-8c67-2b318648b2f5"
    ],
    "relatedControls": [
      "au-2",
      "au-12",
      "cm-2",
      "cm-6",
      "si-3"
    ]
  },
  {
    "id": "sc-18.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-18",
    "family": "System and Communications Protection",
    "title": "Identify Unacceptable Code and Take Corrective Actions",
    "description": "Identify [unacceptable mobile code] and take [corrective actions].",
    "priority": "P3"
  },
  {
    "id": "sc-18.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-18",
    "family": "System and Communications Protection",
    "title": "Acquisition, Development, and Use",
    "description": "Verify that the acquisition, development, and use of mobile code to be deployed in the system meets [mobile code requirements].",
    "priority": "P3"
  },
  {
    "id": "sc-18.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-18",
    "family": "System and Communications Protection",
    "title": "Prevent Downloading and Execution",
    "description": "Prevent the download and execution of [unacceptable mobile code].",
    "priority": "P3"
  },
  {
    "id": "sc-18.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-18",
    "family": "System and Communications Protection",
    "title": "Prevent Automatic Execution",
    "description": "Prevent the automatic execution of mobile code in [software applications] and enforce [actions] prior to executing the code.",
    "priority": "P3"
  },
  {
    "id": "sc-18.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-18",
    "family": "System and Communications Protection",
    "title": "Allow Execution Only in Confined Environments",
    "description": "Allow execution of permitted mobile code only in confined virtual machine environments.",
    "priority": "P3",
    "relatedControls": [
      "sc-44",
      "si-7"
    ]
  },
  {
    "id": "sc-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Voice Over Internet Protocol",
    "description": "Technology-specific; addressed as any other technology or protocol.",
    "priority": "P3"
  },
  {
    "id": "sc-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Separation of System and User Functionality",
    "description": "Separate user functionality, including user interface services, from system management functionality.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-6",
      "sa-4",
      "sa-8",
      "sc-3",
      "sc-7",
      "sc-22",
      "sc-32",
      "sc-39"
    ]
  },
  {
    "id": "sc-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-2",
    "family": "System and Communications Protection",
    "title": "Interfaces for Non-privileged Users",
    "description": "Prevent the presentation of system management functionality at interfaces to non-privileged users.",
    "priority": "P3",
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "sc-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-2",
    "family": "System and Communications Protection",
    "title": "Disassociability",
    "description": "Store state information from applications and software separately.",
    "priority": "P3"
  },
  {
    "id": "sc-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Secure Name/Address Resolution Service (Authoritative Source)",
    "description": "Provide additional data origin authentication and integrity verification artifacts along with the authoritative name resolution data the system returns in response to external name/address resolution queries; and Provide the means to indicate the security status of child zones and (if the child supports secure resolution services) to enable verification of a chain of trust among parent and child domains, when operating as part of a distributed, hierarchical namespace.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "fe209006-bfd4-4033-a79a-9fee1adaf372"
    ],
    "relatedControls": [
      "au-10",
      "sc-8",
      "sc-12",
      "sc-13",
      "sc-21",
      "sc-22"
    ]
  },
  {
    "id": "sc-20.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-20",
    "family": "System and Communications Protection",
    "title": "Child Subspaces",
    "description": "Child Subspaces",
    "priority": "P3"
  },
  {
    "id": "sc-20.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-20",
    "family": "System and Communications Protection",
    "title": "Data Origin and Integrity",
    "description": "Provide data origin and integrity protection artifacts for internal name/address resolution queries.",
    "priority": "P3"
  },
  {
    "id": "sc-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Secure Name/Address Resolution Service (Recursive or Caching Resolver)",
    "description": "Request and perform data origin authentication and data integrity verification on the name/address resolution responses the system receives from authoritative sources.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "fe209006-bfd4-4033-a79a-9fee1adaf372"
    ],
    "relatedControls": [
      "sc-20",
      "sc-22"
    ]
  },
  {
    "id": "sc-21.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-21",
    "family": "System and Communications Protection",
    "title": "Data Origin and Integrity",
    "description": "Data Origin and Integrity",
    "priority": "P3"
  },
  {
    "id": "sc-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Architecture and Provisioning for Name/Address Resolution Service",
    "description": "Ensure the systems that collectively provide name/address resolution service for an organization are fault-tolerant and implement internal and external role separation.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "fe209006-bfd4-4033-a79a-9fee1adaf372"
    ],
    "relatedControls": [
      "sc-2",
      "sc-20",
      "sc-21",
      "sc-24"
    ]
  },
  {
    "id": "sc-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Session Authenticity",
    "description": "Protect the authenticity of communications sessions.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "7537638e-2837-407d-844b-40fb3fafdd99",
      "d4d7c760-2907-403b-8b2a-767ca5370ecd",
      "a6b9907a-2a14-4bb4-a142-d4c73026a8b4",
      "6bc4d137-aece-42a8-8081-9ecb1ebe9fb4"
    ],
    "relatedControls": [
      "au-10",
      "sc-8",
      "sc-10",
      "sc-11"
    ]
  },
  {
    "id": "sc-23.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-23",
    "family": "System and Communications Protection",
    "title": "Invalidate Session Identifiers at Logout",
    "description": "Invalidate session identifiers upon user logout or other session termination.",
    "priority": "P3"
  },
  {
    "id": "sc-23.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-23",
    "family": "System and Communications Protection",
    "title": "User-initiated Logouts and Message Displays",
    "description": "User-initiated Logouts and Message Displays",
    "priority": "P3"
  },
  {
    "id": "sc-23.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-23",
    "family": "System and Communications Protection",
    "title": "Unique System-generated Session Identifiers",
    "description": "Generate a unique session identifier for each session with [randomness requirements] and recognize only session identifiers that are system-generated.",
    "priority": "P3",
    "relatedControls": [
      "ac-10",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-23.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-23",
    "family": "System and Communications Protection",
    "title": "Unique Session Identifiers with Randomization",
    "description": "Unique Session Identifiers with Randomization",
    "priority": "P3"
  },
  {
    "id": "sc-23.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-23",
    "family": "System and Communications Protection",
    "title": "Allowed Certificate Authorities",
    "description": "Only allow the use of [certificated authorities] for verification of the establishment of protected sessions.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Fail in Known State",
    "description": "Fail to a [known system state] for the following failures on the indicated components while preserving [system state information] in failure: [types of system failures on system components].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-2",
      "cp-4",
      "cp-10",
      "cp-12",
      "sa-8",
      "sc-7",
      "sc-22",
      "si-13"
    ]
  },
  {
    "id": "sc-25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Thin Nodes",
    "description": "Employ minimal functionality and information storage on the following system components: [system components].",
    "priority": "P3",
    "relatedControls": [
      "sc-30",
      "sc-44"
    ]
  },
  {
    "id": "sc-26",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Decoys",
    "description": "Include components within organizational systems specifically designed to be the target of malicious attacks for detecting, deflecting, and analyzing such attacks.",
    "priority": "P3",
    "relatedControls": [
      "ra-5",
      "sc-7",
      "sc-30",
      "sc-35",
      "sc-44",
      "si-3",
      "si-4"
    ]
  },
  {
    "id": "sc-26.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-26",
    "family": "System and Communications Protection",
    "title": "Detection of Malicious Code",
    "description": "Detection of Malicious Code",
    "priority": "P3"
  },
  {
    "id": "sc-27",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Platform-independent Applications",
    "description": "Include within organizational systems the following platform independent applications: [platform-independent applications].",
    "priority": "P3",
    "relatedControls": [
      "sc-29"
    ]
  },
  {
    "id": "sc-28",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Protection of Information at Rest",
    "description": "Protect the [choose: confidentiality, integrity] of the following information at rest: [information at rest].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "20957dbb-6a1e-40a2-b38a-66f67d33ac2e",
      "0d083d8a-5cc6-46f1-8d79-3081d42bcb75",
      "eef62b16-c796-4554-955c-505824135b8a",
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f",
      "22f2d4f0-4365-4e88-a30d-275c1f5473ea",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-6",
      "ac-19",
      "ca-7",
      "cm-3",
      "cm-5",
      "cm-6",
      "cp-9",
      "mp-4",
      "mp-5",
      "pe-3",
      "sc-8",
      "sc-12",
      "sc-13",
      "sc-34",
      "si-3",
      "si-7",
      "si-16"
    ]
  },
  {
    "id": "sc-28.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-28",
    "family": "System and Communications Protection",
    "title": "Cryptographic Protection",
    "description": "Implement cryptographic mechanisms to prevent unauthorized disclosure and modification of the following information at rest on [system components or media]: [information].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-19",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-28.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-28",
    "family": "System and Communications Protection",
    "title": "Offline Storage",
    "description": "Remove the following information from online storage and store offline in a secure location: [information].",
    "priority": "P3"
  },
  {
    "id": "sc-28.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-28",
    "family": "System and Communications Protection",
    "title": "Cryptographic Keys",
    "description": "Provide protected storage for cryptographic keys [choose: {{ insert: param, sc-28.03_odp.02 }} , hardware-protected key store].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-29",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Heterogeneity",
    "description": "Employ a diverse set of information technologies for the following system components in the implementation of the system: [system components].",
    "priority": "P3",
    "relatedControls": [
      "au-9",
      "pl-8",
      "sc-27",
      "sc-30",
      "sr-3"
    ]
  },
  {
    "id": "sc-29.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-29",
    "family": "System and Communications Protection",
    "title": "Virtualization Techniques",
    "description": "Employ virtualization techniques to support the deployment of a diversity of operating systems and applications that are changed [frequency].",
    "priority": "P3"
  },
  {
    "id": "sc-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Security Function Isolation",
    "description": "Isolate security functions from nonsecurity functions.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-3",
      "ac-6",
      "ac-25",
      "cm-2",
      "cm-4",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-15",
      "sa-17",
      "sc-2",
      "sc-7",
      "sc-32",
      "sc-39",
      "si-16"
    ]
  },
  {
    "id": "sc-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-3",
    "family": "System and Communications Protection",
    "title": "Hardware Separation",
    "description": "Employ hardware separation mechanisms to implement security function isolation.",
    "priority": "P3"
  },
  {
    "id": "sc-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-3",
    "family": "System and Communications Protection",
    "title": "Access and Flow Control Functions",
    "description": "Isolate security functions enforcing access and information flow control from nonsecurity functions and from other security functions.",
    "priority": "P3"
  },
  {
    "id": "sc-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-3",
    "family": "System and Communications Protection",
    "title": "Minimize Nonsecurity Functionality",
    "description": "Minimize the number of nonsecurity functions included within the isolation boundary containing security functions.",
    "priority": "P3"
  },
  {
    "id": "sc-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-3",
    "family": "System and Communications Protection",
    "title": "Module Coupling and Cohesiveness",
    "description": "Implement security functions as largely independent modules that maximize internal cohesiveness within modules and minimize coupling between modules.",
    "priority": "P3"
  },
  {
    "id": "sc-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-3",
    "family": "System and Communications Protection",
    "title": "Layered Structures",
    "description": "Implement security functions as a layered structure minimizing interactions between layers of the design and avoiding any dependence by lower layers on the functionality or correctness of higher layers.",
    "priority": "P3"
  },
  {
    "id": "sc-30",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Concealment and Misdirection",
    "description": "Employ the following concealment and misdirection techniques for [systems] at [time periods] to confuse and mislead adversaries: [concealment and misdirection techniques].",
    "priority": "P3",
    "relatedControls": [
      "ac-6",
      "sc-25",
      "sc-26",
      "sc-29",
      "sc-44",
      "si-14"
    ]
  },
  {
    "id": "sc-30.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-30",
    "family": "System and Communications Protection",
    "title": "Virtualization Techniques",
    "description": "Virtualization Techniques",
    "priority": "P3"
  },
  {
    "id": "sc-30.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-30",
    "family": "System and Communications Protection",
    "title": "Randomness",
    "description": "Employ [techniques] to introduce randomness into organizational operations and assets.",
    "priority": "P3"
  },
  {
    "id": "sc-30.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-30",
    "family": "System and Communications Protection",
    "title": "Change Processing and Storage Locations",
    "description": "Change the location of [processing and/or storage] [choose: {{ insert: param, sc-30.03_odp.03 }} , random time intervals]].",
    "priority": "P3"
  },
  {
    "id": "sc-30.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-30",
    "family": "System and Communications Protection",
    "title": "Misleading Information",
    "description": "Employ realistic, but misleading information in [system components] about its security state or posture.",
    "priority": "P3"
  },
  {
    "id": "sc-30.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-30",
    "family": "System and Communications Protection",
    "title": "Concealment of System Components",
    "description": "Employ the following techniques to hide or conceal [system components]: [techniques].",
    "priority": "P3"
  },
  {
    "id": "sc-31",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Covert Channel Analysis",
    "description": "Perform a covert channel analysis to identify those aspects of communications within the system that are potential avenues for covert [choose: storage, timing] channels; and Estimate the maximum bandwidth of those channels.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-4",
      "sa-8",
      "si-11"
    ]
  },
  {
    "id": "sc-31.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-31",
    "family": "System and Communications Protection",
    "title": "Test Covert Channels for Exploitability",
    "description": "Test a subset of the identified covert channels to determine the channels that are exploitable.",
    "priority": "P3"
  },
  {
    "id": "sc-31.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-31",
    "family": "System and Communications Protection",
    "title": "Maximum Bandwidth",
    "description": "Reduce the maximum bandwidth for identified covert [choose: storage, timing] channels to [values].",
    "priority": "P3"
  },
  {
    "id": "sc-31.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-31",
    "family": "System and Communications Protection",
    "title": "Measure Bandwidth in Operational Environments",
    "description": "Measure the bandwidth of [subset of identified covert channels] in the operational environment of the system.",
    "priority": "P3"
  },
  {
    "id": "sc-32",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "System Partitioning",
    "description": "Partition the system into [system components] residing in separate [choose: physical, logical] domains or environments based on [circumstances for the physical or logical separation of components].",
    "priority": "P3",
    "references": [
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "d4296805-2dca-4c63-a95f-eeccaa826aec"
    ],
    "relatedControls": [
      "ac-4",
      "ac-6",
      "sa-8",
      "sc-2",
      "sc-3",
      "sc-7",
      "sc-36"
    ]
  },
  {
    "id": "sc-32.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-32",
    "family": "System and Communications Protection",
    "title": "Separate Physical Domains for Privileged Functions",
    "description": "Partition privileged functions into separate physical domains.",
    "priority": "P3"
  },
  {
    "id": "sc-33",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Transmission Preparation Integrity",
    "description": "Transmission Preparation Integrity",
    "priority": "P3"
  },
  {
    "id": "sc-34",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Non-modifiable Executable Programs",
    "description": "For [system components] , load and execute: The operating environment from hardware-enforced, read-only media; and The following applications from hardware-enforced, read-only media: [applications].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "si-7",
      "si-14"
    ]
  },
  {
    "id": "sc-34.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-34",
    "family": "System and Communications Protection",
    "title": "No Writable Storage",
    "description": "Employ [system components] with no writeable storage that is persistent across component restart or power on/off.",
    "priority": "P3",
    "relatedControls": [
      "ac-19",
      "mp-7"
    ]
  },
  {
    "id": "sc-34.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-34",
    "family": "System and Communications Protection",
    "title": "Integrity Protection on Read-only Media",
    "description": "Protect the integrity of information prior to storage on read-only media and control the media after such information has been recorded onto the media.",
    "priority": "P3",
    "relatedControls": [
      "cm-3",
      "cm-5",
      "cm-9",
      "mp-2",
      "mp-4",
      "mp-5",
      "sc-28",
      "si-3"
    ]
  },
  {
    "id": "sc-34.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-34",
    "family": "System and Communications Protection",
    "title": "Hardware-based Protection",
    "description": "Hardware-based Protection",
    "priority": "P3"
  },
  {
    "id": "sc-35",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "External Malicious Code Identification",
    "description": "Include system components that proactively seek to identify network-based malicious code or malicious websites.",
    "priority": "P3",
    "relatedControls": [
      "sc-7",
      "sc-26",
      "sc-44",
      "si-3",
      "si-4"
    ]
  },
  {
    "id": "sc-36",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Distributed Processing and Storage",
    "description": "Distribute the following processing and storage components across multiple [choose: physical locations, logical domains]: [organization-defined processing and storage components].",
    "priority": "P3",
    "references": [
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "cp-6",
      "cp-7",
      "pl-8",
      "sc-32"
    ]
  },
  {
    "id": "sc-36.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-36",
    "family": "System and Communications Protection",
    "title": "Polling Techniques",
    "description": "Employ polling techniques to identify potential faults, errors, or compromises to the following processing and storage components: [distributed processing and storage components] ; and Take the following actions in response to identified faults, errors, or compromises: [actions].",
    "priority": "P3",
    "relatedControls": [
      "si-4"
    ]
  },
  {
    "id": "sc-36.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-36",
    "family": "System and Communications Protection",
    "title": "Synchronization",
    "description": "Synchronize the following duplicate systems or system components: [duplicate systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "cp-9"
    ]
  },
  {
    "id": "sc-37",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Out-of-band Channels",
    "description": "Employ the following out-of-band channels for the physical delivery or electronic transmission of [information, system components, or devices] to [individuals or systems]: [out-of-band channels].",
    "priority": "P3",
    "references": [
      "110e26af-4765-49e1-8740-6750f83fcda1",
      "e7942589-e267-4a5a-a3d9-f39a7aae81f0",
      "8306620b-1920-4d73-8b21-12008528595f"
    ],
    "relatedControls": [
      "ac-2",
      "cm-3",
      "cm-5",
      "cm-7",
      "ia-2",
      "ia-4",
      "ia-5",
      "ma-4",
      "sc-12",
      "si-3",
      "si-4",
      "si-7"
    ]
  },
  {
    "id": "sc-37.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-37",
    "family": "System and Communications Protection",
    "title": "Ensure Delivery and Transmission",
    "description": "Employ [controls] to ensure that only [individuals or systems] receive the following information, system components, or devices: [information, system components, or devices].",
    "priority": "P3"
  },
  {
    "id": "sc-38",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Operations Security",
    "description": "Employ the following operations security controls to protect key organizational information throughout the system development life cycle: [operations security controls].",
    "priority": "P3",
    "relatedControls": [
      "ca-2",
      "ca-7",
      "pl-1",
      "pm-9",
      "pm-12",
      "ra-2",
      "ra-3",
      "ra-5",
      "sc-7",
      "sr-3",
      "sr-7"
    ]
  },
  {
    "id": "sc-39",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Process Isolation",
    "description": "Maintain a separate execution domain for each executing system process.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "ac-6",
      "ac-25",
      "sa-8",
      "sc-2",
      "sc-3",
      "si-16"
    ]
  },
  {
    "id": "sc-39.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-39",
    "family": "System and Communications Protection",
    "title": "Hardware Separation",
    "description": "Implement hardware separation mechanisms to facilitate process isolation.",
    "priority": "P3"
  },
  {
    "id": "sc-39.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-39",
    "family": "System and Communications Protection",
    "title": "Separate Execution Domain Per Thread",
    "description": "Maintain a separate execution domain for each thread in [multi-threaded processing].",
    "priority": "P3"
  },
  {
    "id": "sc-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Information in Shared System Resources",
    "description": "Prevent unauthorized and unintended information transfer via shared system resources.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "sa-8"
    ]
  },
  {
    "id": "sc-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-4",
    "family": "System and Communications Protection",
    "title": "Security Levels",
    "description": "Security Levels",
    "priority": "P3"
  },
  {
    "id": "sc-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-4",
    "family": "System and Communications Protection",
    "title": "Multilevel or Periods Processing",
    "description": "Prevent unauthorized information transfer via shared resources in accordance with [procedures] when system processing explicitly switches between different information classification levels or security categories.",
    "priority": "P3"
  },
  {
    "id": "sc-40",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Wireless Link Protection",
    "description": "Protect external and internal [organization-defined wireless links] from the following signal parameter attacks: [organization-defined types of signal parameter attacks or references to sources for such attacks].",
    "priority": "P3",
    "relatedControls": [
      "ac-18",
      "sc-5"
    ]
  },
  {
    "id": "sc-40.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-40",
    "family": "System and Communications Protection",
    "title": "Electromagnetic Interference",
    "description": "Implement cryptographic mechanisms that achieve [level of protection] against the effects of intentional electromagnetic interference.",
    "priority": "P3",
    "relatedControls": [
      "pe-21",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-40.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-40",
    "family": "System and Communications Protection",
    "title": "Reduce Detection Potential",
    "description": "Implement cryptographic mechanisms to reduce the detection potential of wireless links to [level of reduction].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-40.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-40",
    "family": "System and Communications Protection",
    "title": "Imitative or Manipulative Communications Deception",
    "description": "Implement cryptographic mechanisms to identify and reject wireless transmissions that are deliberate attempts to achieve imitative or manipulative communications deception based on signal parameters.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13",
      "si-4"
    ]
  },
  {
    "id": "sc-40.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-40",
    "family": "System and Communications Protection",
    "title": "Signal Parameter Identification",
    "description": "Implement cryptographic mechanisms to prevent the identification of [wireless transmitters] by using the transmitter signal parameters.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-41",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Port and I/O Device Access",
    "description": "[choose: physically, logically] disable or remove [connection ports or input/output devices] on the following systems or system components: [systems or system components].",
    "priority": "P3",
    "relatedControls": [
      "ac-20",
      "mp-7"
    ]
  },
  {
    "id": "sc-42",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Sensor Capability and Data",
    "description": "Prohibit [choose: the use of devices possessing {{ insert: param, sc-42_odp.02 }} in {{ insert: param, sc-42_odp.03 }} , the remote activation of environmental sensing capabilities on organizational systems or system components with the following exceptions: {{ insert: param, sc-42_odp.04 }} ] ; and Provide an explicit indication of sensor use to [group of users].",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394"
    ],
    "relatedControls": [
      "sc-15"
    ]
  },
  {
    "id": "sc-42.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-42",
    "family": "System and Communications Protection",
    "title": "Reporting to Authorized Individuals or Roles",
    "description": "Verify that the system is configured so that data or information collected by the [sensors] is only reported to authorized individuals or roles.",
    "priority": "P3"
  },
  {
    "id": "sc-42.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-42",
    "family": "System and Communications Protection",
    "title": "Authorized Use",
    "description": "Employ the following measures so that data or information collected by [sc-42.01_odp] is only used for authorized purposes: [measures].",
    "priority": "P3",
    "relatedControls": [
      "pt-2"
    ]
  },
  {
    "id": "sc-42.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-42",
    "family": "System and Communications Protection",
    "title": "Prohibit Use of Devices",
    "description": "Prohibit Use of Devices",
    "priority": "P3"
  },
  {
    "id": "sc-42.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-42",
    "family": "System and Communications Protection",
    "title": "Notice of Collection",
    "description": "Employ the following measures to facilitate an individual’s awareness that personally identifiable information is being collected by [sensors]: [measures].",
    "priority": "P3",
    "relatedControls": [
      "pt-1",
      "pt-4",
      "pt-5"
    ]
  },
  {
    "id": "sc-42.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-42",
    "family": "System and Communications Protection",
    "title": "Collection Minimization",
    "description": "Employ [sensors] that are configured to minimize the collection of information about individuals that is not needed.",
    "priority": "P3",
    "relatedControls": [
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "sc-43",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Usage Restrictions",
    "description": "Establish usage restrictions and implementation guidelines for the following system components: [components] ; and Authorize, monitor, and control the use of such components within the system.",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "0f66be67-85e7-4ca6-bd19-39453e9f4394"
    ],
    "relatedControls": [
      "ac-18",
      "ac-19",
      "cm-6",
      "sc-7",
      "sc-18"
    ]
  },
  {
    "id": "sc-44",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Detonation Chambers",
    "description": "Employ a detonation chamber capability within [system, system component, or location].",
    "priority": "P3",
    "references": [
      "1c71b420-2bd9-4e52-9fc8-390f58b85b59"
    ],
    "relatedControls": [
      "sc-7",
      "sc-18",
      "sc-25",
      "sc-26",
      "sc-30",
      "sc-35",
      "sc-39",
      "si-3",
      "si-7"
    ]
  },
  {
    "id": "sc-45",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "System Time Synchronization",
    "description": "Synchronize system clocks within and between systems and system components.",
    "priority": "P3",
    "references": [
      "e4d37285-1e79-4029-8b6a-42df39cace30"
    ],
    "relatedControls": [
      "ac-3",
      "au-8",
      "ia-2",
      "ia-8"
    ]
  },
  {
    "id": "sc-45.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-45",
    "family": "System and Communications Protection",
    "title": "Synchronization with Authoritative Time Source",
    "description": "Compare the internal system clocks [frequency] with [authoritative time source] ; and Synchronize the internal system clocks to the authoritative time source when the time difference is greater than [time period].",
    "priority": "P3"
  },
  {
    "id": "sc-45.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-45",
    "family": "System and Communications Protection",
    "title": "Secondary Authoritative Time Source",
    "description": "Identify a secondary authoritative time source that is in a different geographic region than the primary authoritative time source; and Synchronize the internal system clocks to the secondary authoritative time source if the primary authoritative time source is unavailable.",
    "priority": "P3"
  },
  {
    "id": "sc-46",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Cross Domain Policy Enforcement",
    "description": "Implement a policy enforcement mechanism [choose: physically, logically] between the physical and/or network interfaces for the connecting security domains.",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ac-4",
      "sc-7"
    ]
  },
  {
    "id": "sc-47",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Alternate Communications Paths",
    "description": "Establish [alternate communication paths] for system operations organizational command and control.",
    "priority": "P3",
    "references": [
      "bc39f179-c735-4da2-b7a7-b2b622119755",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "cp-2",
      "cp-8"
    ]
  },
  {
    "id": "sc-48",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Sensor Relocation",
    "description": "Relocate [sensors and monitoring capabilities] to [locations] under the following conditions or circumstances: [conditions or circumstances].",
    "priority": "P3",
    "references": [
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "au-2",
      "sc-7",
      "si-4"
    ]
  },
  {
    "id": "sc-48.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-48",
    "family": "System and Communications Protection",
    "title": "Dynamic Relocation of Sensors or Monitoring Capabilities",
    "description": "Dynamically relocate [sensors and monitoring capabilities] to [locations] under the following conditions or circumstances: [conditions or circumstances].",
    "priority": "P3"
  },
  {
    "id": "sc-49",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Hardware-enforced Separation and Policy Enforcement",
    "description": "Implement hardware-enforced separation and policy enforcement mechanisms between [security domains].",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ac-4",
      "sa-8",
      "sc-50"
    ]
  },
  {
    "id": "sc-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Denial-of-service Protection",
    "description": "[choose: protect against, limit] the effects of the following types of denial-of-service events: [types of denial-of-service events] ; and Employ the following controls to achieve the denial-of-service objective: [controls by type of denial-of-service event].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "f5edfe51-d1f2-422e-9b27-5d0e90b49c72"
    ],
    "relatedControls": [
      "cp-2",
      "ir-4",
      "sc-6",
      "sc-7",
      "sc-40"
    ]
  },
  {
    "id": "sc-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-5",
    "family": "System and Communications Protection",
    "title": "Restrict Ability to Attack Other Systems",
    "description": "Restrict the ability of individuals to launch the following denial-of-service attacks against other systems: [denial-of-service attacks].",
    "priority": "P3"
  },
  {
    "id": "sc-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-5",
    "family": "System and Communications Protection",
    "title": "Capacity, Bandwidth, and Redundancy",
    "description": "Manage capacity, bandwidth, or other redundancy to limit the effects of information flooding denial-of-service attacks.",
    "priority": "P3"
  },
  {
    "id": "sc-5.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-5",
    "family": "System and Communications Protection",
    "title": "Detection and Monitoring",
    "description": "Employ the following monitoring tools to detect indicators of denial-of-service attacks against, or launched from, the system: [monitoring tools] ; and Monitor the following system resources to determine if sufficient resources exist to prevent effective denial-of-service attacks: [system resources].",
    "priority": "P3",
    "relatedControls": [
      "ca-7",
      "si-4"
    ]
  },
  {
    "id": "sc-50",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Software-enforced Separation and Policy Enforcement",
    "description": "Implement software-enforced separation and policy enforcement mechanisms between [security domains].",
    "priority": "P3",
    "references": [
      "e3cc0520-a366-4fc9-abc2-5272db7e3564"
    ],
    "relatedControls": [
      "ac-3",
      "ac-4",
      "sa-8",
      "sc-2",
      "sc-3",
      "sc-49"
    ]
  },
  {
    "id": "sc-51",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Hardware-based Protection",
    "description": "Employ hardware-based, write-protect for [system firmware components] ; and Implement specific procedures for [authorized individuals] to manually disable hardware write-protect for firmware modifications and re-enable the write-protect prior to returning to operational mode.",
    "priority": "P3"
  },
  {
    "id": "sc-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Resource Availability",
    "description": "Protect the availability of resources by allocating [resources] by [choose: priority, quota, {{ insert: param, sc-06_odp.03 }} ].",
    "priority": "P3",
    "references": [
      "047b041a-b4b0-4537-ab2d-2b36283eeda0",
      "4f42ee6e-86cc-403b-a51f-76c2b4f81b54"
    ],
    "relatedControls": [
      "sc-5"
    ]
  },
  {
    "id": "sc-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Boundary Protection",
    "description": "Monitor and control communications at the external managed interfaces to the system and at key internal managed interfaces within the system; Implement subnetworks for publicly accessible system components that are [choose: physically, logically] separated from internal organizational networks; and Connect to external networks or systems only through managed interfaces consisting of boundary protection devices arranged in accordance with an organizational security and privacy architecture.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "628d22a1-6a11-4784-bc59-5cd9497b5445",
      "482e4c99-9dc4-41ad-bba8-0f3f0032c1f8",
      "a7f0e897-29a3-45c4-bd88-40dfef0e034a",
      "d4d7c760-2907-403b-8b2a-767ca5370ecd",
      "f5edfe51-d1f2-422e-9b27-5d0e90b49c72"
    ],
    "relatedControls": [
      "ac-4",
      "ac-17",
      "ac-18",
      "ac-19",
      "ac-20",
      "au-13",
      "ca-3",
      "cm-2",
      "cm-4",
      "cm-7",
      "cm-10",
      "cp-8",
      "cp-10",
      "ir-4",
      "ma-4",
      "pe-3",
      "pl-8",
      "pm-12",
      "sa-8",
      "sa-17",
      "sc-5",
      "sc-26",
      "sc-32",
      "sc-35",
      "sc-43"
    ]
  },
  {
    "id": "sc-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Physically Separated Subnetworks",
    "description": "Physically Separated Subnetworks",
    "priority": "P3"
  },
  {
    "id": "sc-7.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Prevent Exfiltration",
    "description": "Prevent the exfiltration of information; and Conduct exfiltration tests [frequency].",
    "priority": "P3",
    "relatedControls": [
      "ac-2",
      "ca-8",
      "si-3"
    ]
  },
  {
    "id": "sc-7.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Restrict Incoming Communications Traffic",
    "description": "Only allow incoming communications from [authorized sources] to be routed to [authorized destinations].",
    "priority": "P3",
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "sc-7.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Host-based Protection",
    "description": "Implement [host-based boundary protection mechanisms] at [system components].",
    "priority": "P3"
  },
  {
    "id": "sc-7.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Isolation of Security Tools, Mechanisms, and Support Components",
    "description": "Isolate [information security tools, mechanisms, and support components] from other internal system components by implementing physically separate subnetworks with managed interfaces to other components of the system.",
    "priority": "P3",
    "relatedControls": [
      "sc-2",
      "sc-3"
    ]
  },
  {
    "id": "sc-7.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Protect Against Unauthorized Physical Connections",
    "description": "Protect against unauthorized physical connections at [managed interfaces].",
    "priority": "P3",
    "relatedControls": [
      "pe-4",
      "pe-19"
    ]
  },
  {
    "id": "sc-7.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Networked Privileged Accesses",
    "description": "Route networked, privileged accesses through a dedicated, managed interface for purposes of access control and auditing.",
    "priority": "P3",
    "relatedControls": [
      "ac-2",
      "ac-3",
      "au-2",
      "si-4"
    ]
  },
  {
    "id": "sc-7.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Prevent Discovery of System Components",
    "description": "Prevent the discovery of specific system components that represent a managed interface.",
    "priority": "P3"
  },
  {
    "id": "sc-7.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Automated Enforcement of Protocol Formats",
    "description": "Enforce adherence to protocol formats.",
    "priority": "P3",
    "relatedControls": [
      "sc-4"
    ]
  },
  {
    "id": "sc-7.18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Fail Secure",
    "description": "Prevent systems from entering unsecure states in the event of an operational failure of a boundary protection device.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cp-2",
      "cp-12",
      "sc-24"
    ]
  },
  {
    "id": "sc-7.19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Block Communication from Non-organizationally Configured Hosts",
    "description": "Block inbound and outbound communications traffic between [communication clients] that are independently configured by end users and external service providers.",
    "priority": "P3"
  },
  {
    "id": "sc-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Public Access",
    "description": "Public Access",
    "priority": "P3"
  },
  {
    "id": "sc-7.20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Dynamic Isolation and Segregation",
    "description": "Provide the capability to dynamically isolate [system components] from other system components.",
    "priority": "P3"
  },
  {
    "id": "sc-7.21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Isolation of System Components",
    "description": "Employ boundary protection mechanisms to isolate [system components] supporting [missions and/or business functions].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ca-9"
    ]
  },
  {
    "id": "sc-7.22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Separate Subnets for Connecting to Different Security Domains",
    "description": "Implement separate network addresses to connect to systems in different security domains.",
    "priority": "P3"
  },
  {
    "id": "sc-7.23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Disable Sender Feedback on Protocol Validation Failure",
    "description": "Disable feedback to senders on protocol format validation failure.",
    "priority": "P3"
  },
  {
    "id": "sc-7.24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Personally Identifiable Information",
    "description": "For systems that process personally identifiable information: Apply the following processing rules to data elements of personally identifiable information: [processing rules]; Monitor for permitted processing at the external interfaces to the system and at key internal boundaries within the system; Document each processing exception; and Review and remove exceptions that are no longer supported.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pt-2",
      "si-15"
    ]
  },
  {
    "id": "sc-7.25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Unclassified National Security System Connections",
    "description": "Prohibit the direct connection of [unclassified national security system] to an external network without the use of [boundary protection device].",
    "priority": "P3"
  },
  {
    "id": "sc-7.26",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Classified National Security System Connections",
    "description": "Prohibit the direct connection of a classified national security system to an external network without the use of [boundary protection device].",
    "priority": "P3"
  },
  {
    "id": "sc-7.27",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Unclassified Non-national Security System Connections",
    "description": "Prohibit the direct connection of [unclassified, non-national security system] to an external network without the use of [boundary protection device].",
    "priority": "P3"
  },
  {
    "id": "sc-7.28",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Connections to Public Networks",
    "description": "Prohibit the direct connection of [system] to a public network.",
    "priority": "P3"
  },
  {
    "id": "sc-7.29",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Separate Subnets to Isolate Functions",
    "description": "Implement [choose: physically, logically] separate subnetworks to isolate the following critical system components and functions: [critical system components and functions].",
    "priority": "P3"
  },
  {
    "id": "sc-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Access Points",
    "description": "Limit the number of external network connections to the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "sc-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "External Telecommunications Services",
    "description": "Implement a managed interface for each external telecommunication service; Establish a traffic flow policy for each managed interface; Protect the confidentiality and integrity of the information being transmitted across each interface; Document each exception to the traffic flow policy with a supporting mission or business need and duration of that need; Review exceptions to the traffic flow policy [frequency] and remove exceptions that are no longer supported by an explicit mission or business need; Prevent unauthorized exchange of control plane traffic with external networks; Publish information to enable remote networks to detect unauthorized control plane traffic from internal networks; and Filter unauthorized control plane traffic from external networks.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-3",
      "sc-8",
      "sc-20",
      "sc-21",
      "sc-22"
    ]
  },
  {
    "id": "sc-7.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Deny by Default — Allow by Exception",
    "description": "Deny network communications traffic by default and allow network communications traffic by exception [choose: at managed interfaces, for {{ insert: param, sc-07.05_odp.02 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "sc-7.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Response to Recognized Failures",
    "description": "Response to Recognized Failures",
    "priority": "P3"
  },
  {
    "id": "sc-7.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Split Tunneling for Remote Devices",
    "description": "Prevent split tunneling for remote devices connecting to organizational systems unless the split tunnel is securely provisioned using [safeguards].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "sc-7.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Route Traffic to Authenticated Proxy Servers",
    "description": "Route [internal communications traffic] to [external networks] through authenticated proxy servers at managed interfaces.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-3"
    ]
  },
  {
    "id": "sc-7.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-7",
    "family": "System and Communications Protection",
    "title": "Restrict Threatening Outgoing Communications Traffic",
    "description": "Detect and deny outgoing communications traffic posing a threat to external systems; and Audit the identity of internal users associated with denied communications.",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-6",
      "sc-5",
      "sc-38",
      "sc-44",
      "si-3",
      "si-4"
    ]
  },
  {
    "id": "sc-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Transmission Confidentiality and Integrity",
    "description": "Protect the [choose: confidentiality, integrity] of transmitted information.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "736d6310-e403-4b57-a79d-9967970c66d7",
      "7537638e-2837-407d-844b-40fb3fafdd99",
      "d4d7c760-2907-403b-8b2a-767ca5370ecd",
      "fe209006-bfd4-4033-a79a-9fee1adaf372",
      "6bc4d137-aece-42a8-8081-9ecb1ebe9fb4",
      "1c71b420-2bd9-4e52-9fc8-390f58b85b59",
      "4c501da5-9d79-4cb6-ba80-97260e1ce327"
    ],
    "relatedControls": [
      "ac-17",
      "ac-18",
      "au-10",
      "ia-3",
      "ia-8",
      "ia-9",
      "ma-4",
      "pe-4",
      "sa-4",
      "sa-8",
      "sc-7",
      "sc-16",
      "sc-20",
      "sc-23",
      "sc-28"
    ]
  },
  {
    "id": "sc-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-8",
    "family": "System and Communications Protection",
    "title": "Cryptographic Protection",
    "description": "Implement cryptographic mechanisms to [choose: prevent unauthorized disclosure of information, detect changes to information] during transmission.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-8",
    "family": "System and Communications Protection",
    "title": "Pre- and Post-transmission Handling",
    "description": "Maintain the [choose: confidentiality, integrity] of information during preparation for transmission and during reception.",
    "priority": "P3"
  },
  {
    "id": "sc-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-8",
    "family": "System and Communications Protection",
    "title": "Cryptographic Protection for Message Externals",
    "description": "Implement cryptographic mechanisms to protect message externals unless otherwise protected by [alternative physical controls].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-8.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-8",
    "family": "System and Communications Protection",
    "title": "Conceal or Randomize Communications",
    "description": "Implement cryptographic mechanisms to conceal or randomize communication patterns unless otherwise protected by [alternative physical controls].",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "sc-8.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sc-8",
    "family": "System and Communications Protection",
    "title": "Protected Distribution System",
    "description": "Implement [protected distribution system] to [choose: prevent unauthorized disclosure of information, detect changes to information] during transmission.",
    "priority": "P3"
  },
  {
    "id": "sc-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Communications Protection",
    "title": "Transmission Confidentiality",
    "description": "Transmission Confidentiality",
    "priority": "P3"
  },
  {
    "id": "si-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] system and information integrity policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the system and information integrity policy and the associated system and information integrity controls; Designate an [official] to manage the development, documentation, and dissemination of the system and information integrity policy and procedures; and Review and update the current system and information integrity: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f"
    ],
    "relatedControls": [
      "pm-9",
      "ps-8",
      "sa-8",
      "si-12"
    ]
  },
  {
    "id": "si-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Input Validation",
    "description": "Check the validity of the following information inputs: [information inputs].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ]
  },
  {
    "id": "si-10.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Manual Override Capability",
    "description": "Provide a manual override capability for input validation of the following information inputs: [si-10_odp]; Restrict the use of the manual override capability to only [authorized individuals] ; and Audit the use of the manual override capability.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "au-2",
      "au-12"
    ]
  },
  {
    "id": "si-10.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Review and Resolve Errors",
    "description": "Review and resolve input validation errors within [organization-defined time period].",
    "priority": "P3"
  },
  {
    "id": "si-10.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Predictable Behavior",
    "description": "Verify that the system behaves in a predictable and documented manner when invalid inputs are received.",
    "priority": "P3"
  },
  {
    "id": "si-10.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Timing Interactions",
    "description": "Account for timing interactions among system components in determining appropriate responses for invalid inputs.",
    "priority": "P3"
  },
  {
    "id": "si-10.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Restrict Inputs to Trusted Sources and Approved Formats",
    "description": "Restrict the use of information inputs to [trusted sources] and/or [formats].",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-6"
    ]
  },
  {
    "id": "si-10.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-10",
    "family": "System and Information Integrity",
    "title": "Injection Prevention",
    "description": "Prevent untrusted data injections.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-6"
    ]
  },
  {
    "id": "si-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Error Handling",
    "description": "Generate error messages that provide information necessary for corrective actions without revealing information that could be exploited; and Reveal error messages only to [personnel or roles].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-3",
      "sc-31",
      "si-2",
      "si-15"
    ]
  },
  {
    "id": "si-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Management and Retention",
    "description": "Manage and retain information within the system and information output from the system in accordance with applicable laws, executive orders, directives, regulations, policies, standards, guidelines and operational requirements.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate",
      "privacy"
    ],
    "references": [
      "e922fc50-b1f9-469f-92ef-ed7d9803611c",
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ac-16",
      "au-5",
      "au-11",
      "ca-2",
      "ca-3",
      "ca-5",
      "ca-6",
      "ca-7",
      "ca-9",
      "cm-5",
      "cm-9",
      "cp-2",
      "ir-8",
      "mp-2",
      "mp-3",
      "mp-4",
      "mp-6",
      "pl-2",
      "pl-4",
      "pm-4",
      "pm-8",
      "pm-9",
      "ps-2",
      "ps-6",
      "pt-2",
      "pt-3",
      "ra-2",
      "ra-3",
      "sa-5",
      "sa-8",
      "sr-2"
    ]
  },
  {
    "id": "si-12.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-12",
    "family": "System and Information Integrity",
    "title": "Limit Personally Identifiable Information Elements",
    "description": "Limit personally identifiable information being processed in the information life cycle to the following elements of personally identifiable information: [elements of personally identifiable information].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pm-25"
    ]
  },
  {
    "id": "si-12.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-12",
    "family": "System and Information Integrity",
    "title": "Minimize Personally Identifiable Information in Testing, Training, and Research",
    "description": "Use the following techniques to minimize the use of personally identifiable information for research, testing, or training: [organization-defined techniques].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "relatedControls": [
      "pm-22",
      "pm-25",
      "si-19"
    ]
  },
  {
    "id": "si-12.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-12",
    "family": "System and Information Integrity",
    "title": "Information Disposal",
    "description": "Use the following techniques to dispose of, destroy, or erase information following the retention period: [organization-defined techniques].",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "si-13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Predictable Failure Prevention",
    "description": "Determine mean time to failure (MTTF) for the following system components in specific environments of operation: [system components] ; and Provide substitute system components and a means to exchange active and standby components in accordance with the following criteria: [mean time to failure (MTTF) substitution criteria].",
    "priority": "P3",
    "relatedControls": [
      "cp-2",
      "cp-10",
      "cp-13",
      "ma-2",
      "ma-6",
      "sa-8",
      "sc-6"
    ]
  },
  {
    "id": "si-13.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-13",
    "family": "System and Information Integrity",
    "title": "Transferring Component Responsibilities",
    "description": "Take system components out of service by transferring component responsibilities to substitute components no later than [fraction or percentage] of mean time to failure.",
    "priority": "P3"
  },
  {
    "id": "si-13.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-13",
    "family": "System and Information Integrity",
    "title": "Time Limit on Process Execution Without Supervision",
    "description": "Time Limit on Process Execution Without Supervision",
    "priority": "P3"
  },
  {
    "id": "si-13.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-13",
    "family": "System and Information Integrity",
    "title": "Manual Transfer Between Components",
    "description": "Manually initiate transfers between active and standby system components when the use of the active component reaches [percentage] of the mean time to failure.",
    "priority": "P3"
  },
  {
    "id": "si-13.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-13",
    "family": "System and Information Integrity",
    "title": "Standby Component Installation and Notification",
    "description": "If system component failures are detected: Ensure that the standby components are successfully and transparently installed within [time period] ; and [choose: activate {{ insert: param, si-13.04_odp.03 }} , automatically shut down the system, {{ insert: param, si-13.04_odp.04 }} ].",
    "priority": "P3"
  },
  {
    "id": "si-13.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-13",
    "family": "System and Information Integrity",
    "title": "Failover Capability",
    "description": "Provide [choose: real-time, near real-time] [failover capability] for the system.",
    "priority": "P3",
    "relatedControls": [
      "cp-6",
      "cp-7",
      "cp-9"
    ]
  },
  {
    "id": "si-14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Non-persistence",
    "description": "Implement non-persistent [system components and services] that are initiated in a known state and terminated [choose: upon end of session of use, {{ insert: param, si-14_odp.03 }} ].",
    "priority": "P3",
    "relatedControls": [
      "sc-30",
      "sc-34",
      "si-21"
    ]
  },
  {
    "id": "si-14.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-14",
    "family": "System and Information Integrity",
    "title": "Refresh from Trusted Sources",
    "description": "Obtain software and data employed during system component and service refreshes from the following trusted sources: [trusted sources].",
    "priority": "P3"
  },
  {
    "id": "si-14.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-14",
    "family": "System and Information Integrity",
    "title": "Non-persistent Information",
    "description": "[choose: refresh {{ insert: param, si-14.02_odp.02 }} {{ insert: param, si-14.02_odp.03 }} , generate {{ insert: param, si-14.02_odp.04 }} on demand] ; and Delete information when no longer needed.",
    "priority": "P3"
  },
  {
    "id": "si-14.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-14",
    "family": "System and Information Integrity",
    "title": "Non-persistent Connectivity",
    "description": "Establish connections to the system on demand and terminate connections after [choose: completion of a request, a period of non-use].",
    "priority": "P3",
    "relatedControls": [
      "sc-10"
    ]
  },
  {
    "id": "si-15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Output Filtering",
    "description": "Validate information output from the following software programs and/or applications to ensure that the information is consistent with the expected content: [software programs and/or applications].",
    "priority": "P3",
    "relatedControls": [
      "si-3",
      "si-4",
      "si-11"
    ]
  },
  {
    "id": "si-16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Memory Protection",
    "description": "Implement the following controls to protect the system memory from unauthorized code execution: [controls].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ac-25",
      "sc-3",
      "si-7"
    ]
  },
  {
    "id": "si-17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Fail-safe Procedures",
    "description": "Implement the indicated fail-safe procedures when the indicated failures occur: [organization-defined list of failure conditions and associated fail-safe procedures].",
    "priority": "P3",
    "relatedControls": [
      "cp-12",
      "cp-13",
      "sc-24",
      "si-13"
    ]
  },
  {
    "id": "si-18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Personally Identifiable Information Quality Operations",
    "description": "Check the accuracy, relevance, timeliness, and completeness of personally identifiable information across the information life cycle [organization-defined frequency] ; and Correct or delete inaccurate or outdated personally identifiable information.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "227063d4-431e-435f-9e8f-009b6dbc20f4",
      "c15bfc12-a61e-4ca5-bf35-fa9ce3ccb5d2",
      "a2590922-82f3-4277-83c0-ca5bee06dba4"
    ],
    "relatedControls": [
      "pm-22",
      "pm-24",
      "pt-2",
      "si-4"
    ]
  },
  {
    "id": "si-18.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-18",
    "family": "System and Information Integrity",
    "title": "Automation Support",
    "description": "Correct or delete personally identifiable information that is inaccurate or outdated, incorrectly determined regarding impact, or incorrectly de-identified using [automated mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "pm-18",
      "ra-8"
    ]
  },
  {
    "id": "si-18.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-18",
    "family": "System and Information Integrity",
    "title": "Data Tags",
    "description": "Employ data tags to automate the correction or deletion of personally identifiable information across the information life cycle within organizational systems.",
    "priority": "P3",
    "relatedControls": [
      "ac-3",
      "ac-16",
      "sc-16"
    ]
  },
  {
    "id": "si-18.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-18",
    "family": "System and Information Integrity",
    "title": "Collection",
    "description": "Collect personally identifiable information directly from the individual.",
    "priority": "P3"
  },
  {
    "id": "si-18.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-18",
    "family": "System and Information Integrity",
    "title": "Individual Requests",
    "description": "Correct or delete personally identifiable information upon request by individuals or their designated representatives.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ]
  },
  {
    "id": "si-18.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-18",
    "family": "System and Information Integrity",
    "title": "Notice of Correction or Deletion",
    "description": "Notify [recipients] and individuals that the personally identifiable information has been corrected or deleted.",
    "priority": "P3"
  },
  {
    "id": "si-19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "De-identification",
    "description": "Remove the following elements of personally identifiable information from datasets: [elements] ; and Evaluate [frequency] for effectiveness of de-identification.",
    "priority": "P1",
    "baselines": [
      "privacy"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "c15bfc12-a61e-4ca5-bf35-fa9ce3ccb5d2"
    ],
    "relatedControls": [
      "mp-6",
      "pm-22",
      "pm-23",
      "pm-24",
      "ra-2",
      "si-12"
    ]
  },
  {
    "id": "si-19.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Collection",
    "description": "De-identify the dataset upon collection by not collecting personally identifiable information.",
    "priority": "P3"
  },
  {
    "id": "si-19.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Archiving",
    "description": "Prohibit archiving of personally identifiable information elements if those elements in a dataset will not be needed after the dataset is archived.",
    "priority": "P3"
  },
  {
    "id": "si-19.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Release",
    "description": "Remove personally identifiable information elements from a dataset prior to its release if those elements in the dataset do not need to be part of the data release.",
    "priority": "P3"
  },
  {
    "id": "si-19.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Removal, Masking, Encryption, Hashing, or Replacement of Direct Identifiers",
    "description": "Remove, mask, encrypt, hash, or replace direct identifiers in a dataset.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "si-19.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Statistical Disclosure Control",
    "description": "Manipulate numerical data, contingency tables, and statistical findings so that no individual or organization is identifiable in the results of the analysis.",
    "priority": "P3"
  },
  {
    "id": "si-19.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Differential Privacy",
    "description": "Prevent disclosure of personally identifiable information by adding non-deterministic noise to the results of mathematical operations before the results are reported.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "si-19.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Validated Algorithms and Software",
    "description": "Perform de-identification using validated algorithms and software that is validated to implement the algorithms.",
    "priority": "P3"
  },
  {
    "id": "si-19.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-19",
    "family": "System and Information Integrity",
    "title": "Motivated Intruder",
    "description": "Perform a motivated intruder test on the de-identified dataset to determine if the identified data remains or if the de-identified data can be re-identified.",
    "priority": "P3"
  },
  {
    "id": "si-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Flaw Remediation",
    "description": "Identify, report, and correct system flaws; Test software and firmware updates related to flaw remediation for effectiveness and potential side effects before installation; Install security-relevant software and firmware updates within [time period] of the release of the updates; and Incorporate flaw remediation into the organizational configuration management process.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "155f941a-cba9-4afd-9ca6-5d040d697ba9",
      "20db4e66-e257-450c-b2e4-2bb9a62a2c88",
      "aa5d04e0-6090-4e17-84d4-b9963d55fc2c",
      "fe209006-bfd4-4033-a79a-9fee1adaf372"
    ],
    "relatedControls": [
      "ca-5",
      "cm-3",
      "cm-4",
      "cm-5",
      "cm-6",
      "cm-8",
      "ma-2",
      "ra-5",
      "sa-8",
      "sa-10",
      "sa-11",
      "si-3",
      "si-5",
      "si-7",
      "si-11"
    ]
  },
  {
    "id": "si-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Central Management",
    "description": "Central Management",
    "priority": "P3"
  },
  {
    "id": "si-2.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Automated Flaw Remediation Status",
    "description": "Determine if system components have applicable security-relevant software and firmware updates installed using [automated mechanisms] [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "ca-7",
      "si-4"
    ]
  },
  {
    "id": "si-2.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Time to Remediate Flaws and Benchmarks for Corrective Actions",
    "description": "Measure the time between flaw identification and flaw remediation; and Establish the following benchmarks for taking corrective actions: [benchmarks].",
    "priority": "P3"
  },
  {
    "id": "si-2.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Automated Patch Management Tools",
    "description": "Employ automated patch management tools to facilitate flaw remediation to the following system components: [components].",
    "priority": "P3"
  },
  {
    "id": "si-2.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Automatic Software and Firmware Updates",
    "description": "Install [security-relevant software and firmware updates] automatically to [system components].",
    "priority": "P3"
  },
  {
    "id": "si-2.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Removal of Previous Versions of Software and Firmware",
    "description": "Remove previous versions of [software and firmware components] after updated versions have been installed.",
    "priority": "P3"
  },
  {
    "id": "si-2.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-2",
    "family": "System and Information Integrity",
    "title": "Root Cause Analysis",
    "description": "Conduct root cause analysis to identify underlying causes of issues or failures. Develop actions to address the root cause of the issue or failure. Implement the actions and monitor the implementation for effectiveness.",
    "priority": "P3",
    "relatedControls": [
      "ac-1",
      "at-1",
      "au-1",
      "ca-1",
      "cm-1",
      "cp-1",
      "ia-1",
      "ir-1",
      "ma-1",
      "mp-1",
      "pe-1",
      "pl-1",
      "pm-1",
      "ps-1",
      "pt-1",
      "ra-1",
      "sa-1",
      "sc-1",
      "si-1",
      "sr-1",
      "au-2",
      "ca-7",
      "ir-6",
      "ir-8",
      "ma-3",
      "ra-5",
      "sa-11",
      "sa-15",
      "sr-8"
    ]
  },
  {
    "id": "si-20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Tainting",
    "description": "Embed data or capabilities in the following systems or system components to determine if organizational data has been exfiltrated or improperly removed from the organization: [systems or system components].",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "au-13"
    ]
  },
  {
    "id": "si-21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Refresh",
    "description": "Refresh [information] at [frequencies] or generate the information on demand and delete the information when no longer needed.",
    "priority": "P3",
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ],
    "relatedControls": [
      "si-14"
    ]
  },
  {
    "id": "si-22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Diversity",
    "description": "Identify the following alternative sources of information for [essential functions and services]: [alternative information sources] ; and Use an alternative information source for the execution of essential functions or services on [systems or system components] when the primary source of information is corrupted or unavailable.",
    "priority": "P3",
    "references": [
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ]
  },
  {
    "id": "si-23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Fragmentation",
    "description": "Based on [circumstances]: Fragment the following information: [information] ; and Distribute the fragmented information across the following systems or system components: [systems or system components].",
    "priority": "P3",
    "references": [
      "61ccf0f4-d3e7-42db-9796-ce6cb1c85989"
    ]
  },
  {
    "id": "si-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Malicious Code Protection",
    "description": "Implement [choose: signature-based, non-signature-based] malicious code protection mechanisms at system entry and exit points to detect and eradicate malicious code; Automatically update malicious code protection mechanisms as new releases are available in accordance with organizational configuration management policy and procedures; Configure malicious code protection mechanisms to: Perform periodic scans of the system [frequency] and real-time scans of files from external sources at [choose: endpoint, network entry and exit points] as the files are downloaded, opened, or executed in accordance with organizational policy; and [choose: block malicious code, quarantine malicious code, take {{ insert: param, si-03_odp.05 }} ] ; and send alert to [personnel or roles] in response to malicious code detection; and Address the receipt of false positives during malicious code detection and eradication and the resulting potential impact on the availability of the system.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "3dd249b0-f57d-44ba-a03e-c3eab1b835ff",
      "88660532-2dcf-442e-845c-03340ce48999",
      "1c71b420-2bd9-4e52-9fc8-390f58b85b59"
    ],
    "relatedControls": [
      "ac-4",
      "ac-19",
      "cm-3",
      "cm-8",
      "ir-4",
      "ma-3",
      "ma-4",
      "pl-9",
      "ra-5",
      "sc-7",
      "sc-23",
      "sc-26",
      "sc-28",
      "sc-44",
      "si-2",
      "si-4",
      "si-7",
      "si-8",
      "si-15"
    ]
  },
  {
    "id": "si-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Central Management",
    "description": "Central Management",
    "priority": "P3"
  },
  {
    "id": "si-3.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Malicious Code Analysis",
    "description": "Employ the following tools and techniques to analyze the characteristics and behavior of malicious code: [tools and techniques] ; and Incorporate the results from malicious code analysis into organizational incident response and flaw remediation processes.",
    "priority": "P3"
  },
  {
    "id": "si-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Automatic Updates",
    "description": "Automatic Updates",
    "priority": "P3"
  },
  {
    "id": "si-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Non-privileged Users",
    "description": "Non-privileged Users",
    "priority": "P3"
  },
  {
    "id": "si-3.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Updates Only by Privileged Users",
    "description": "Update malicious code protection mechanisms only when directed by a privileged user.",
    "priority": "P3",
    "relatedControls": [
      "cm-5"
    ]
  },
  {
    "id": "si-3.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Portable Storage Devices",
    "description": "Portable Storage Devices",
    "priority": "P3"
  },
  {
    "id": "si-3.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Testing and Verification",
    "description": "Test malicious code protection mechanisms [frequency] by introducing known benign code into the system; and Verify that the detection of the code and the associated incident reporting occur.",
    "priority": "P3",
    "relatedControls": [
      "ca-2",
      "ca-7",
      "ra-5"
    ]
  },
  {
    "id": "si-3.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Nonsignature-based Detection",
    "description": "Nonsignature-based Detection",
    "priority": "P3"
  },
  {
    "id": "si-3.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Detect Unauthorized Commands",
    "description": "Detect the following unauthorized operating system commands through the kernel application programming interface on [system hardware components]: [unauthorized operating system commands] ; and [choose: issue a warning, audit the command execution, prevent the execution of the command].",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-6",
      "au-12"
    ]
  },
  {
    "id": "si-3.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-3",
    "family": "System and Information Integrity",
    "title": "Authenticate Remote Commands",
    "description": "Authenticate Remote Commands",
    "priority": "P3"
  },
  {
    "id": "si-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "System Monitoring",
    "description": "Monitor the system to detect: Attacks and indicators of potential attacks in accordance with the following monitoring objectives: [monitoring objectives] ; and Unauthorized local, network, and remote connections; Identify unauthorized use of the system through the following techniques and methods: [techniques and methods]; Invoke internal monitoring capabilities or deploy monitoring devices: Strategically within the system to collect organization-determined essential information; and At ad hoc locations within the system to track specific types of transactions of interest to the organization; Analyze detected events and anomalies; Adjust the level of system monitoring activity when there is a change in risk to organizational operations and assets, individuals, other organizations, or the Nation; Obtain legal opinion regarding system monitoring activities; and Provide [system monitoring information] to [personnel or roles] [choose: as needed, {{ insert: param, si-04_odp.06 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "49b8aa2d-a88c-4bff-9f20-876ccb8f7dcb",
      "3dd249b0-f57d-44ba-a03e-c3eab1b835ff",
      "5eee45d8-3313-4fdc-8d54-1742092bbdd6",
      "25e3e57b-dc2f-4934-af9b-050b020c6f0e",
      "067223d8-1ec7-45c5-b21b-c848da6de8fb"
    ],
    "relatedControls": [
      "ac-2",
      "ac-3",
      "ac-4",
      "ac-8",
      "ac-17",
      "au-2",
      "au-6",
      "au-7",
      "au-9",
      "au-12",
      "au-13",
      "au-14",
      "ca-7",
      "cm-3",
      "cm-6",
      "cm-8",
      "cm-11",
      "ia-10",
      "ir-4",
      "ma-3",
      "ma-4",
      "pl-9",
      "pm-12",
      "ra-5",
      "ra-10",
      "sc-5",
      "sc-7",
      "sc-18",
      "sc-26",
      "sc-31",
      "sc-35",
      "sc-36",
      "sc-37",
      "sc-43",
      "si-3",
      "si-6",
      "si-7",
      "sr-9",
      "sr-10"
    ]
  },
  {
    "id": "si-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "System-wide Intrusion Detection System",
    "description": "Connect and configure individual intrusion detection tools into a system-wide intrusion detection system.",
    "priority": "P3"
  },
  {
    "id": "si-4.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Visibility of Encrypted Communications",
    "description": "Make provisions so that [encrypted communications traffic] is visible to [system monitoring tools and mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "si-4.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Analyze Communications Traffic Anomalies",
    "description": "Analyze outbound communications traffic at the external interfaces to the system and selected [interior points] to discover anomalies.",
    "priority": "P3"
  },
  {
    "id": "si-4.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Automated Organization-generated Alerts",
    "description": "Alert [personnel or roles] using [automated mechanisms] when the following indications of inappropriate or unusual activities with security or privacy implications occur: [activities that trigger alerts].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "si-4.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Analyze Traffic and Event Patterns",
    "description": "Analyze communications traffic and event patterns for the system; Develop profiles representing common traffic and event patterns; and Use the traffic and event profiles in tuning system-monitoring devices.",
    "priority": "P3"
  },
  {
    "id": "si-4.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Wireless Intrusion Detection",
    "description": "Employ a wireless intrusion detection system to identify rogue wireless devices and to detect attack attempts and potential compromises or breaches to the system.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-18",
      "ia-3"
    ]
  },
  {
    "id": "si-4.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Wireless to Wireline Communications",
    "description": "Employ an intrusion detection system to monitor wireless communications traffic as the traffic passes from wireless to wireline networks.",
    "priority": "P3",
    "relatedControls": [
      "ac-18"
    ]
  },
  {
    "id": "si-4.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Correlate Monitoring Information",
    "description": "Correlate information from monitoring tools and mechanisms employed throughout the system.",
    "priority": "P3",
    "relatedControls": [
      "au-6"
    ]
  },
  {
    "id": "si-4.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Integrated Situational Awareness",
    "description": "Correlate information from monitoring physical, cyber, and supply chain activities to achieve integrated, organization-wide situational awareness.",
    "priority": "P3",
    "relatedControls": [
      "au-16",
      "pe-6",
      "sr-2",
      "sr-4",
      "sr-6"
    ]
  },
  {
    "id": "si-4.18",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Analyze Traffic and Covert Exfiltration",
    "description": "Analyze outbound communications traffic at external interfaces to the system and at the following interior points to detect covert exfiltration of information: [interior points].",
    "priority": "P3"
  },
  {
    "id": "si-4.19",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Risk for Individuals",
    "description": "Implement [additional monitoring] of individuals who have been identified by [sources] as posing an increased level of risk.",
    "priority": "P3"
  },
  {
    "id": "si-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Automated Tools and Mechanisms for Real-time Analysis",
    "description": "Employ automated tools and mechanisms to support near real-time analysis of events.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "pm-23",
      "pm-25"
    ]
  },
  {
    "id": "si-4.20",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Privileged Users",
    "description": "Implement the following additional monitoring of privileged users: [additional monitoring].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "ac-18"
    ]
  },
  {
    "id": "si-4.21",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Probationary Periods",
    "description": "Implement the following additional monitoring of individuals during [probationary period]: [additional monitoring].",
    "priority": "P3",
    "relatedControls": [
      "ac-18"
    ]
  },
  {
    "id": "si-4.22",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Unauthorized Network Services",
    "description": "Detect network services that have not been authorized or approved by [authorization or approval processes] ; and [choose: audit, alert {{ insert: param, si-04.22_odp.03 }} ] when detected.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cm-7"
    ]
  },
  {
    "id": "si-4.23",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Host-based Devices",
    "description": "Implement the following host-based monitoring mechanisms at [system components]: [host-based monitoring mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "ac-18",
      "ac-19"
    ]
  },
  {
    "id": "si-4.24",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Indicators of Compromise",
    "description": "Discover, collect, and distribute to [personnel or roles] , indicators of compromise provided by [sources].",
    "priority": "P3",
    "relatedControls": [
      "ac-18"
    ]
  },
  {
    "id": "si-4.25",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Optimize Network Traffic Analysis",
    "description": "Provide visibility into network traffic at external and key internal system interfaces to optimize the effectiveness of monitoring devices.",
    "priority": "P3"
  },
  {
    "id": "si-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Automated Tool and Mechanism Integration",
    "description": "Employ automated tools and mechanisms to integrate intrusion detection tools and mechanisms into access control and flow control mechanisms.",
    "priority": "P3",
    "relatedControls": [
      "pm-23",
      "pm-25"
    ]
  },
  {
    "id": "si-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Inbound and Outbound Communications Traffic",
    "description": "Determine criteria for unusual or unauthorized activities or conditions for inbound and outbound communications traffic; Monitor inbound and outbound communications traffic [organization-defined frequency] for [organization-defined unusual or unauthorized activities or conditions].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "si-4.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "System-generated Alerts",
    "description": "Alert [personnel or roles] when the following system-generated indications of compromise or potential compromise occur: [compromise indicators].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-4",
      "au-5",
      "pe-6"
    ]
  },
  {
    "id": "si-4.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Restrict Non-privileged Users",
    "description": "Restrict Non-privileged Users",
    "priority": "P3"
  },
  {
    "id": "si-4.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Automated Response to Suspicious Events",
    "description": "Notify [incident response personnel] of detected suspicious events; and Take the following actions upon detection: [least-disruptive actions].",
    "priority": "P3"
  },
  {
    "id": "si-4.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Protection of Monitoring Information",
    "description": "Protection of Monitoring Information",
    "priority": "P3"
  },
  {
    "id": "si-4.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-4",
    "family": "System and Information Integrity",
    "title": "Testing of Monitoring Tools and Mechanisms",
    "description": "Test intrusion-monitoring tools and mechanisms [frequency].",
    "priority": "P3"
  },
  {
    "id": "si-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Security Alerts, Advisories, and Directives",
    "description": "Receive system security alerts, advisories, and directives from [external organizations] on an ongoing basis; Generate internal security alerts, advisories, and directives as deemed necessary; Disseminate security alerts, advisories, and directives to: [choose: {{ insert: param, si-05_odp.03 }} , {{ insert: param, si-05_odp.04 }} , {{ insert: param, si-05_odp.05 }} ] ; and Implement security directives in accordance with established time frames, or notify the issuing organization of the degree of noncompliance.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "155f941a-cba9-4afd-9ca6-5d040d697ba9"
    ],
    "relatedControls": [
      "pm-15",
      "ra-5",
      "si-2"
    ]
  },
  {
    "id": "si-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-5",
    "family": "System and Information Integrity",
    "title": "Automated Alerts and Advisories",
    "description": "Broadcast security alert and advisory information throughout the organization using [automated mechanisms].",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "si-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Security and Privacy Function Verification",
    "description": "Verify the correct operation of [organization-defined security and privacy functions]; Perform the verification of the functions specified in SI-6a [choose: {{ insert: param, si-06_odp.04 }} , upon command by user with appropriate privilege, {{ insert: param, si-06_odp.05 }} ]; Alert [personnel or roles] to failed security and privacy verification tests; and [choose: shut the system down, restart the system, {{ insert: param, si-06_odp.08 }} ] when anomalies are discovered.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef"
    ],
    "relatedControls": [
      "ca-7",
      "cm-4",
      "cm-6",
      "si-7"
    ]
  },
  {
    "id": "si-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-6",
    "family": "System and Information Integrity",
    "title": "Notification of Failed Security Tests",
    "description": "Notification of Failed Security Tests",
    "priority": "P3"
  },
  {
    "id": "si-6.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-6",
    "family": "System and Information Integrity",
    "title": "Automation Support for Distributed Testing",
    "description": "Implement automated mechanisms to support the management of distributed security and privacy function testing.",
    "priority": "P3",
    "relatedControls": [
      "si-2"
    ]
  },
  {
    "id": "si-6.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-6",
    "family": "System and Information Integrity",
    "title": "Report Verification Results",
    "description": "Report the results of security and privacy function verification to [personnel or roles].",
    "priority": "P3",
    "relatedControls": [
      "si-4",
      "sr-4",
      "sr-5"
    ]
  },
  {
    "id": "si-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Software, Firmware, and Information Integrity",
    "description": "Employ integrity verification tools to detect unauthorized changes to the following software, firmware, and information: [organization-defined software, firmware, and information] ; and Take the following actions when unauthorized changes to the software, firmware, and information are detected: [organization-defined actions].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "27847491-5ce1-4f6a-a1e4-9e483782f0ef",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "4895b4cd-34c5-4667-bf8a-27d443c12047",
      "e47ee630-9cbc-4133-880e-e013f83ccd51"
    ],
    "relatedControls": [
      "ac-4",
      "cm-3",
      "cm-7",
      "cm-8",
      "ma-3",
      "ma-4",
      "ra-5",
      "sa-8",
      "sa-9",
      "sa-10",
      "sc-8",
      "sc-12",
      "sc-13",
      "sc-28",
      "sc-37",
      "si-3",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-6",
      "sr-9",
      "sr-10",
      "sr-11"
    ]
  },
  {
    "id": "si-7.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Integrity Checks",
    "description": "Perform an integrity check of [organization-defined software, firmware, and information] [choose: at startup, at {{ insert: param, si-7.1_prm_3 }} , {{ insert: param, si-7.1_prm_4 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "si-7.10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Protection of Boot Firmware",
    "description": "Implement the following mechanisms to protect the integrity of boot firmware in [system components]: [mechanisms].",
    "priority": "P3",
    "relatedControls": [
      "si-6"
    ]
  },
  {
    "id": "si-7.11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Confined Environments with Limited Privileges",
    "description": "Confined Environments with Limited Privileges",
    "priority": "P3"
  },
  {
    "id": "si-7.12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Integrity Verification",
    "description": "Require that the integrity of the following user-installed software be verified prior to execution: [user-installed software].",
    "priority": "P3",
    "references": [
      "fe209006-bfd4-4033-a79a-9fee1adaf372"
    ],
    "relatedControls": [
      "si-2",
      "cm-11"
    ]
  },
  {
    "id": "si-7.13",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Code Execution in Protected Environments",
    "description": "Code Execution in Protected Environments",
    "priority": "P3"
  },
  {
    "id": "si-7.14",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Binary or Machine Executable Code",
    "description": "Binary or Machine Executable Code",
    "priority": "P3"
  },
  {
    "id": "si-7.15",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Code Authentication",
    "description": "Implement cryptographic mechanisms to authenticate the following software or firmware components prior to installation: [software or firmware components].",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "cm-5",
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "si-7.16",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Time Limit on Process Execution Without Supervision",
    "description": "Prohibit processes from executing without supervision for more than [time period].",
    "priority": "P3"
  },
  {
    "id": "si-7.17",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Runtime Application Self-protection",
    "description": "Implement [controls] for application self-protection at runtime.",
    "priority": "P3",
    "relatedControls": [
      "si-16"
    ]
  },
  {
    "id": "si-7.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Automated Notifications of Integrity Violations",
    "description": "Employ automated tools that provide notification to [personnel or roles] upon discovering discrepancies during integrity verification.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "si-7.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Centrally Managed Integrity Tools",
    "description": "Employ centrally managed integrity verification tools.",
    "priority": "P3",
    "relatedControls": [
      "au-3",
      "si-2",
      "si-8"
    ]
  },
  {
    "id": "si-7.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Tamper-evident Packaging",
    "description": "Tamper-evident Packaging",
    "priority": "P3"
  },
  {
    "id": "si-7.5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Automated Response to Integrity Violations",
    "description": "Automatically [choose: shut down the system, restart the system, implement {{ insert: param, si-07.05_odp.02 }} ] when integrity violations are discovered.",
    "priority": "P0",
    "baselines": [
      "high"
    ]
  },
  {
    "id": "si-7.6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Cryptographic Protection",
    "description": "Implement cryptographic mechanisms to detect unauthorized changes to software, firmware, and information.",
    "priority": "P3",
    "relatedControls": [
      "sc-12",
      "sc-13"
    ]
  },
  {
    "id": "si-7.7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Integration of Detection and Response",
    "description": "Incorporate the detection of the following unauthorized changes into the organizational incident response capability: [changes].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "relatedControls": [
      "au-2",
      "au-6",
      "ir-4",
      "ir-5",
      "si-4"
    ]
  },
  {
    "id": "si-7.8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Auditing Capability for Significant Events",
    "description": "Upon detection of a potential integrity violation, provide the capability to audit the event and initiate the following actions: [choose: generate an audit record, alert current user, alert {{ insert: param, si-07.08_odp.02 }} , {{ insert: param, si-07.08_odp.03 }} ].",
    "priority": "P3",
    "relatedControls": [
      "au-2",
      "au-6",
      "au-12"
    ]
  },
  {
    "id": "si-7.9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-7",
    "family": "System and Information Integrity",
    "title": "Verify Boot Process",
    "description": "Verify the integrity of the boot process of the following system components: [system components].",
    "priority": "P3",
    "relatedControls": [
      "si-6"
    ]
  },
  {
    "id": "si-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Spam Protection",
    "description": "Employ spam protection mechanisms at system entry and exit points to detect and act on unsolicited messages; and Update spam protection mechanisms when new releases are available in accordance with organizational configuration management policy and procedures.",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "314e33cb-3681-4b50-a2a2-3fae9604accd",
      "1c71b420-2bd9-4e52-9fc8-390f58b85b59"
    ],
    "relatedControls": [
      "pl-9",
      "sc-5",
      "sc-7",
      "sc-38",
      "si-3",
      "si-4"
    ]
  },
  {
    "id": "si-8.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-8",
    "family": "System and Information Integrity",
    "title": "Central Management",
    "description": "Central Management",
    "priority": "P3"
  },
  {
    "id": "si-8.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-8",
    "family": "System and Information Integrity",
    "title": "Automatic Updates",
    "description": "Automatically update spam protection mechanisms [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ]
  },
  {
    "id": "si-8.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "si-8",
    "family": "System and Information Integrity",
    "title": "Continuous Learning Capability",
    "description": "Implement spam protection mechanisms with a learning capability to more effectively identify legitimate communications traffic.",
    "priority": "P3"
  },
  {
    "id": "si-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "System and Information Integrity",
    "title": "Information Input Restrictions",
    "description": "Information Input Restrictions",
    "priority": "P3"
  },
  {
    "id": "sr-1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Policy and Procedures",
    "description": "Develop, document, and disseminate to [organization-defined personnel or roles]: [choose: organization-level, mission/business process-level, system-level] supply chain risk management policy that: Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and Procedures to facilitate the implementation of the supply chain risk management policy and the associated supply chain risk management controls; Designate an [official] to manage the development, documentation, and dissemination of the supply chain risk management policy and procedures; and Review and update the current supply chain risk management: Policy [frequency] and following [events] ; and Procedures [frequency] and following [events].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "031cc4b7-9adf-4835-98f1-f1ca493519cf",
      "c7ac44e8-10db-4b64-b2b9-9e32ec1efed0",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "4c0ec2ee-a0d6-428a-9043-4504bc3ade6f",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2"
    ],
    "relatedControls": [
      "pm-9",
      "pm-30",
      "ps-8",
      "si-12"
    ]
  },
  {
    "id": "sr-10",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Inspection of Systems or Components",
    "description": "Inspect the following systems or system components [choose: at random, at {{ insert: param, sr-10_odp.03 }} , upon {{ insert: param, sr-10_odp.04 }} ] to detect tampering: [systems or system components].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "15a95e24-65b6-4686-bc18-90855a10457d"
    ],
    "relatedControls": [
      "at-3",
      "pm-30",
      "si-4",
      "si-7",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-9",
      "sr-11"
    ]
  },
  {
    "id": "sr-11",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Component Authenticity",
    "description": "Develop and implement anti-counterfeit policy and procedures that include the means to detect and prevent counterfeit components from entering the system; and Report counterfeit system components to [choose: source of counterfeit component, {{ insert: param, sr-11_odp.02 }} , {{ insert: param, sr-11_odp.03 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "15a95e24-65b6-4686-bc18-90855a10457d"
    ],
    "relatedControls": [
      "pe-3",
      "sa-4",
      "si-7",
      "sr-9",
      "sr-10"
    ]
  },
  {
    "id": "sr-11.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-11",
    "family": "Supply Chain Risk Management",
    "title": "Anti-counterfeit Training",
    "description": "Train [personnel or roles] to detect counterfeit system components (including hardware, software, and firmware).",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "at-3"
    ]
  },
  {
    "id": "sr-11.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-11",
    "family": "Supply Chain Risk Management",
    "title": "Configuration Control for Component Service and Repair",
    "description": "Maintain configuration control over the following system components awaiting service or repair and serviced or repaired components awaiting return to service: [system components].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "cm-3",
      "ma-2",
      "ma-4",
      "sa-10"
    ]
  },
  {
    "id": "sr-11.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-11",
    "family": "Supply Chain Risk Management",
    "title": "Anti-counterfeit Scanning",
    "description": "Scan for counterfeit system components [frequency].",
    "priority": "P3",
    "relatedControls": [
      "ra-5"
    ]
  },
  {
    "id": "sr-12",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Component Disposal",
    "description": "Dispose of [data, documentation, tools, or system components] using the following techniques and methods: [techniques and methods].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "relatedControls": [
      "mp-6"
    ]
  },
  {
    "id": "sr-2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Supply Chain Risk Management Plan",
    "description": "Develop a plan for managing supply chain risks associated with the research and development, design, manufacturing, acquisition, delivery, integration, operations and maintenance, and disposal of the following systems, system components or system services: [systems, system components, or system services]; Review and update the supply chain risk management plan [frequency] or as required, to address threat, organizational or environmental changes; and Protect the supply chain risk management plan from unauthorized disclosure and modification.",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "031cc4b7-9adf-4835-98f1-f1ca493519cf",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "cec037f3-8aba-4c97-84b4-4082f9e515d2",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "276bd50a-7e58-48e5-a405-8c8cb91d7a5f",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "ca-2",
      "cp-4",
      "ir-4",
      "ma-2",
      "ma-6",
      "pe-16",
      "pl-2",
      "pm-9",
      "pm-30",
      "ra-3",
      "ra-7",
      "sa-8",
      "si-4"
    ]
  },
  {
    "id": "sr-2.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-2",
    "family": "Supply Chain Risk Management",
    "title": "Establish SCRM Team",
    "description": "Establish a supply chain risk management team consisting of [personnel, roles and responsibilities] to lead and support the following SCRM activities: [supply chain risk management activities].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ]
  },
  {
    "id": "sr-3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Supply Chain Controls and Processes",
    "description": "Establish a process or processes to identify and address weaknesses or deficiencies in the supply chain elements and processes of [system or system component] in coordination with [supply chain personnel]; Employ the following controls to protect against supply chain risks to the system, system component, or system service and to limit the harm or consequences from supply chain-related events: [supply chain controls] ; and Document the selected and implemented supply chain processes and controls in [choose: security and privacy plans, supply chain risk management plan, {{ insert: param, sr-03_odp.05 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "15a95e24-65b6-4686-bc18-90855a10457d",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba"
    ],
    "relatedControls": [
      "ca-2",
      "ma-2",
      "ma-6",
      "pe-3",
      "pe-16",
      "pl-8",
      "pm-30",
      "sa-2",
      "sa-3",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-9",
      "sa-10",
      "sa-15",
      "sc-7",
      "sc-29",
      "sc-30",
      "sc-38",
      "si-7",
      "sr-6",
      "sr-9",
      "sr-11"
    ]
  },
  {
    "id": "sr-3.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-3",
    "family": "Supply Chain Risk Management",
    "title": "Diverse Supply Base",
    "description": "Employ a diverse set of sources for the following system components and services: [organization-defined system components and services].",
    "priority": "P3"
  },
  {
    "id": "sr-3.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-3",
    "family": "Supply Chain Risk Management",
    "title": "Limitation of Harm",
    "description": "Employ the following controls to limit harm from potential adversaries identifying and targeting the organizational supply chain: [controls].",
    "priority": "P3"
  },
  {
    "id": "sr-3.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-3",
    "family": "Supply Chain Risk Management",
    "title": "Sub-tier Flow Down",
    "description": "Ensure that the controls included in the contracts of prime contractors are also included in the contracts of subcontractors.",
    "priority": "P3",
    "relatedControls": [
      "sr-5",
      "sr-8"
    ]
  },
  {
    "id": "sr-4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Provenance",
    "description": "Document, monitor, and maintain valid provenance of the following systems, system components, and associated data: [systems, system components, and associated data].",
    "priority": "P3",
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "15a95e24-65b6-4686-bc18-90855a10457d",
      "e3cc0520-a366-4fc9-abc2-5272db7e3564",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba",
      "a2590922-82f3-4277-83c0-ca5bee06dba4",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "cm-8",
      "ma-2",
      "ma-6",
      "ra-9",
      "sa-3",
      "sa-8",
      "si-4"
    ]
  },
  {
    "id": "sr-4.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-4",
    "family": "Supply Chain Risk Management",
    "title": "Identity",
    "description": "Establish and maintain unique identification of the following supply chain elements, processes, and personnel associated with the identified system and critical system components: [supply chain elements, processes, and personnel].",
    "priority": "P3",
    "relatedControls": [
      "ia-2",
      "ia-8",
      "pe-16"
    ]
  },
  {
    "id": "sr-4.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-4",
    "family": "Supply Chain Risk Management",
    "title": "Track and Trace",
    "description": "Establish and maintain unique identification of the following systems and critical system components for tracking through the supply chain: [systems and critical system components].",
    "priority": "P3",
    "relatedControls": [
      "ia-2",
      "ia-8",
      "pe-16",
      "pl-2"
    ]
  },
  {
    "id": "sr-4.3",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-4",
    "family": "Supply Chain Risk Management",
    "title": "Validate as Genuine and Not Altered",
    "description": "Employ the following controls to validate that the system or system component received is genuine and has not been altered: [organization-defined controls].",
    "priority": "P3",
    "relatedControls": [
      "at-3",
      "sr-9",
      "sr-10",
      "sr-11"
    ]
  },
  {
    "id": "sr-4.4",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-4",
    "family": "Supply Chain Risk Management",
    "title": "Supply Chain Integrity — Pedigree",
    "description": "Employ [controls] and conduct [analysis method] to ensure the integrity of the system and system components by validating the internal composition and provenance of critical or mission-essential technologies, products, and services.",
    "priority": "P3",
    "relatedControls": [
      "ra-3"
    ]
  },
  {
    "id": "sr-5",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Acquisition Strategies, Tools, and Methods",
    "description": "Employ the following acquisition strategies, contract tools, and procurement methods to protect against, identify, and mitigate supply chain risks: [strategies, tools, and methods].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "15a95e24-65b6-4686-bc18-90855a10457d",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "at-3",
      "sa-2",
      "sa-3",
      "sa-4",
      "sa-5",
      "sa-8",
      "sa-9",
      "sa-10",
      "sa-15",
      "sr-6",
      "sr-9",
      "sr-10",
      "sr-11"
    ]
  },
  {
    "id": "sr-5.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-5",
    "family": "Supply Chain Risk Management",
    "title": "Adequate Supply",
    "description": "Employ the following controls to ensure an adequate supply of [critical system components]: [controls].",
    "priority": "P3",
    "relatedControls": [
      "ra-9"
    ]
  },
  {
    "id": "sr-5.2",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-5",
    "family": "Supply Chain Risk Management",
    "title": "Assessments Prior to Selection, Acceptance, Modification, or Update",
    "description": "Assess the system, system component, or system service prior to selection, acceptance, modification, or update.",
    "priority": "P3",
    "relatedControls": [
      "ca-8",
      "ra-5",
      "sa-11",
      "si-7"
    ]
  },
  {
    "id": "sr-6",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Supplier Assessments and Reviews",
    "description": "Assess and review the supply chain-related risks associated with suppliers or contractors and the system, system component, or system service they provide [frequency].",
    "priority": "P0",
    "baselines": [
      "high",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "15a95e24-65b6-4686-bc18-90855a10457d",
      "678e3d6c-150b-4393-aec5-6e3481eb1e00",
      "eea3c092-42ed-4382-a6f4-1adadef01b9d",
      "7c37a38d-21d7-40d8-bc3d-b5e27eac17e1",
      "a295ca19-8c75-4b4c-8800-98024732e181",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba",
      "38ff38f0-1366-4f50-a4c9-26a39aacee16"
    ],
    "relatedControls": [
      "sr-3",
      "sr-5"
    ]
  },
  {
    "id": "sr-6.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-6",
    "family": "Supply Chain Risk Management",
    "title": "Testing and Analysis",
    "description": "Employ [choose: organizational analysis, independent third-party analysis, organizational testing, independent third-party testing] of the following supply chain elements, processes, and actors associated with the system, system component, or system service: [supply chain elements, processes, and actors].",
    "priority": "P3",
    "relatedControls": [
      "ca-8",
      "si-4"
    ]
  },
  {
    "id": "sr-7",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Supply Chain Operations Security",
    "description": "Employ the following Operations Security (OPSEC) controls to protect supply chain-related information for the system, system component, or system service: [OPSEC controls].",
    "priority": "P3",
    "references": [
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba"
    ],
    "relatedControls": [
      "sc-38"
    ]
  },
  {
    "id": "sr-8",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Notification Agreements",
    "description": "Establish agreements and procedures with entities involved in the supply chain for the system, system component, or system service for the [choose: notification of supply chain compromises, {{ insert: param, sr-08_odp.02 }} ].",
    "priority": "P0",
    "baselines": [
      "high",
      "low",
      "moderate"
    ],
    "references": [
      "4ff10ed3-d8fe-4246-99e3-443045e27482",
      "0f963c17-ab5a-432a-a867-91eac550309b",
      "21caa535-1154-4369-ba7b-32c309fee0f7",
      "863caf2a-978a-4260-9e8d-4a8929bce40c",
      "08b07465-dbdc-48d6-8a0b-37279602ac16",
      "e8e84963-14fc-4c3a-be05-b412a5d37cd2",
      "e24b06cc-9129-4998-a76a-65c3d7a576ba"
    ],
    "relatedControls": [
      "ir-4",
      "ir-6",
      "ir-8"
    ]
  },
  {
    "id": "sr-9",
    "frameworkId": "nist-800-53-rev5",
    "kind": "base",
    "family": "Supply Chain Risk Management",
    "title": "Tamper Resistance and Detection",
    "description": "Implement a tamper protection program for the system, system component, or system service.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "references": [
      "15a95e24-65b6-4686-bc18-90855a10457d"
    ],
    "relatedControls": [
      "pe-3",
      "pm-30",
      "sa-15",
      "si-4",
      "si-7",
      "sr-3",
      "sr-4",
      "sr-5",
      "sr-10",
      "sr-11"
    ]
  },
  {
    "id": "sr-9.1",
    "frameworkId": "nist-800-53-rev5",
    "kind": "enhancement",
    "parentId": "sr-9",
    "family": "Supply Chain Risk Management",
    "title": "Multiple Stages of System Development Life Cycle",
    "description": "Employ anti-tamper technologies, tools, and techniques throughout the system development life cycle.",
    "priority": "P0",
    "baselines": [
      "high"
    ],
    "relatedControls": [
      "sa-3"
    ]
  }
];
