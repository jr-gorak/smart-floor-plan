import '../../css/Dropdown.css';

function ExportDropdown({activeDropdown}) {

  return (
    <div>
    {activeDropdown === 'export' &&
    <div className="dropdown-container">
        <div className='dropdown-content'>
        <button>Export to Home Assistant</button>
        <button>Export as pdf</button>
        </div>
    </div>
    }
    </div>
  );
}

export default ExportDropdown;