export const ExampleMatch = {
  eta: null,
  shortcode: '19E71517',
  pickup_notes: null,
  id: '19e71517-b8f3-4d37-ae8b-590ea728dc66',
  completed_at: null,
  shipper: {
    name: 'Poet Shipper',
    phone: '9493940689',
  },
  fees: [
    {
      amount: 2040,
      description: null,
      id: '8f49ee26-0286-4f5e-956a-9458be688391',
      name: 'Base Fee',
      type: 'base_fee',
    },
  ],
  origin_photo: null,
  origin_address: {
    address: '1 Infinite Loop',
    address2: null,
    city: 'Cupertino',
    country: 'United States',
    country_code: 'US',
    formatted_address:
      'Infinite Loop 1, 1 Infinite Loop, Cupertino, CA 95014, USA',
    lat: 37.3318598,
    lng: -122.0302485,
    name: null,
    neighborhood: null,
    state: 'California',
    state_code: 'CA',
    zip: '95014',
  },
  cancel_reason: null,
  vehicle_class: 'Car',
  total_weight: 1,
  scheduled: false,
  created_at: '2023-04-05T19:44:44',
  vehicle_class_id: 1,
  po: null,
  pickup_at: null,
  self_sender: true,
  service_level: 1,
  total_volume: 1,
  distance: 2.7,
  bill_of_lading_photo: null,
  stops: [
    {
      delivery_notes: null,
      destination_address: {
        address: '5241 Stevens Creek Boulevard',
        address2: null,
        city: 'Santa Clara',
        country: 'United States',
        country_code: 'US',
        formatted_address:
          '5241 Stevens Creek Blvd, Santa Clara, CA 95051, USA',
        lat: 37.3231957,
        lng: -121.994705,
        name: null,
        neighborhood: null,
        state: 'California',
        state_code: 'CA',
        zip: '95051',
      },
      destination_photo: null,
      destination_photo_required: false,
      driver_tip: 0,
      dropoff_by: null,
      eta: null,
      has_load_fee: false,
      id: '6879fa05-f0d2-4245-93bf-7c2c36003c58',
      identifier: null,
      index: 0,
      items: [
        {
          barcode: null,
          barcode_delivery_required: false,
          barcode_pickup_required: false,
          barcode_readings: [],
          declared_value: 100,
          description: 'desc',
          height: 1,
          id: 'e8d55e97-12bd-460d-aa62-4b8a2ae4b869',
          length: 1,
          pieces: 1,
          type: 'item',
          volume: 1,
          weight: 1,
          width: 1,
        },
      ],
      needs_pallet_jack: false,
      po: null,
      recipient: null,
      self_recipient: true,
      signature_instructions: null,
      signature_name: null,
      signature_photo: null,
      signature_required: true,
      signature_type: 'electronic',
      state: 'pending',
      state_transition: null,
    },
  ],
  driver_id: null,
  sender: null,
  slas: [
    {
      completed_at: null,
      end_time: '2023-04-05T19:54:59Z',
      start_time: '2023-04-05T19:44:59Z',
      type: 'acceptance',
    },
    {
      completed_at: null,
      end_time: '2023-04-05T20:54:59Z',
      start_time: '2023-04-05T19:54:59Z',
      type: 'pickup',
    },
    {
      completed_at: null,
      end_time: '2023-04-05T21:16:27Z',
      start_time: '2023-04-05T20:54:59Z',
      type: 'delivery',
    },
  ],
  driver_total_pay: 20.4,
  dropoff_at: null,
  bill_of_lading_required: null,
  accepted_at: null,
  picked_up_at: null,
  origin_photo_required: false,
  state: 'assigning_driver',
  rating: null,
  driver_email: null,
  unload_method: null,
};

export default ExampleMatch;
